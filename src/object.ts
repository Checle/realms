export const global = (new Function('return this'))()

export function preventExtensions (object: any): void {
  do {
    Object.preventExtensions(object)
    object = Object.getPrototypeOf(object)
  } while (object != null)
}

let frozenObjects = new WeakSet<any>()

export function freeze (object: any): void {
  if (object === global) new TypeError('Cannot freeze the global scope')
  if (!(object instanceof Object) || frozenObjects.has(object)) return

  frozenObjects.add(object)

  let properties = Object.getOwnPropertyNames(object)

  // A frozen property in the prototype chain will prevent a property of the same name on an inheriting object from being set (e.g., `toString`) so circumvent this
  for (let name of properties) {
    let descriptor = Object.getOwnPropertyDescriptor(object, name)

    if (descriptor.writable && descriptor.configurable) {
      Object.defineProperty(object, name, {
        get () {
          return descriptor.value
        },
        set (value) {
          if (this === object) return object

          // Defines a property on the inheritor, preventing the frozen parent from being set
          Object.defineProperty(this, name, {value, writable: true, configurable: true, enumerable: descriptor.enumerable})
        },
        enumerable: descriptor.enumerable,
      })
    }
  }

  if (!Object.isFrozen(object)) {
    // Shallow-freeze object
    Object.freeze(object)

    // Drop out as soon as any non-standard behavior is observed
    if (!Object.isFrozen(object)) {
      throw new ReferenceError('Unexpected built-in')
    }
  }

  // Recurse to parent
  freeze(Object.getPrototypeOf(object))

  // Freeze properties
  for (let name of properties) {
    // As a getter might be triggered which in fact does throw an error in certain contexts, errors have to be catched
    let value

    try { value = object[name] }
    catch (error) { continue }

    freeze(value)
  }
}

// TODO clone lazily (may lead to inconsistent states though)

export function clone (object): any {
  return shim(object, new WeakMap(), new WeakMap())

  function shim (object, origins, targets) {
    if (!(object instanceof Object)) return object

    let target = targets.get(object)

    if (target != null) return target

    let prototype = Object.getPrototypeOf(object)

    if (typeof object === 'function') {
      target = function (...args) {
        let result = object.apply(this, args.map(arg => shim(arg, targets, origins)))

        return shim(result, origins, targets)
      }
    } else {
      target = Object.create(shim(prototype, origins, targets))
    }

    origins.set(target, object)
    targets.set(object, target)

    for (let name of Object.getOwnPropertyNames(object)) {
      let descriptor = Object.getOwnPropertyDescriptor(object, name)

      for (let key in descriptor) {
        descriptor[key] = shim(descriptor[key], origins, targets)
      }

      Object.defineProperty(target, name, descriptor)
    }

    if (!Object.isExtensible(object)) Object.preventExtensions(target)
    if (Object.isFrozen(object)) Object.freeze(target)
    if (Object.isSealed(object)) Object.seal(target)

    return target
  }
}