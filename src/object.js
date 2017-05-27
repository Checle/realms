export const global = (new Function('return this'))()

let nonNativeObjects = new WeakSet()

export function isNative(fn) {
  if (!nonNativeObjects.has(fn)) {
    try {
      new Function('(' + fn + ')')
    } catch (e) { // Syntax error occurred
      return true
    }

    nonNativeObjects.add(fn)
  }

  return false
}

export function preventExtensions (object) {
  do {
    Object.preventExtensions(object)
    object = Object.getPrototypeOf(object)
  } while (object != null)
}

let frozenObjects = new WeakSet()

export function freeze (object) {
  // Prevent recursion to the host global object for security reasons
  if (object === global) new TypeError('Cannot freeze the global scope')

  // Omit primitive values
  if (object == null || typeof object !== 'function' && typeof object !== 'object') {
    return object
  }

  // Freeze only once
  if (frozenObjects.has(object)) return object

  frozenObjects.add(object)

  let prototype = Object.getPrototypeOf(object)
  let properties = Object.getOwnPropertyNames(object)

  // A frozen property in the prototype chain will prevent a property of the same name on an inheriting object from being set (e.g., `toString`), so circumvent this
  for (let name of properties) {
    let descriptor = Object.getOwnPropertyDescriptor(object, name)

    if (descriptor.writable && descriptor.configurable) {
      Object.defineProperty(object, name, {
        enumerable: descriptor.enumerable,

        get () {
          return descriptor.value
        },

        set (value) {
          if (this === object) return object

          // Defines a property on the inheritor, preventing the frozen parent from being set
          Object.defineProperty(this, name, {value, writable: true, configurable: true, enumerable: descriptor.enumerable})
        },
      })
    }
  }

  if (!Object.isFrozen(object)) {
    // Shallow-freeze object
    Object.freeze(object)

    // Drop out as soon as any non-standard behavior is observed
    if (!Object.isFrozen(object) && prototype !== null) {
      throw new ReferenceError('Unexpected built-in')
    }
  }

  // Recurse to parent
  freeze(prototype)

  // Freeze properties
  for (let name of properties) {
    // As a getter might be triggered which in fact does throw an error in certain contexts, errors have to be catched
    let value

    try { value = object[name] }
    catch (error) { continue }

    freeze(value)
  }

  return object
}

export function clone (object) {
  function shim (object, origins, targets) {
    function clone (object) {
      if (object == null || typeof object !== 'object' && typeof object !== 'function') {
        return object
      }

      let target = targets.get(object)

      if (target != null) return target

      let prototype = Object.getPrototypeOf(object)
      let constructor = object.constructor

      if (typeof object === 'function') {
        target = function (...args) {
          args = args.map(arg => shim(arg, targets, origins))

          let result = new.target ? new object(...args) : object.apply(this, args)

          return clone(result)
        }
      } else if (Array.isArray(object)) {
        target = Array.prototype.slice.call(object)
      } else if (isNative(constructor) && prototype === constructor.prototype) {
        if (typeof constructor.from === 'function') target = constructor.from(object)
        else target = new constructor(object)
      } else {
        target = Object.create(clone(prototype))
      }

      origins.set(target, object)
      targets.set(object, target)

      for (let name of Object.getOwnPropertyNames(object)) {
        let descriptor = Object.getOwnPropertyDescriptor(object, name)

        for (let key in descriptor) {
          descriptor[key] = clone(descriptor[key])
        }

        Object.defineProperty(target, name, descriptor)
      }

      if (!Object.isExtensible(object)) Object.preventExtensions(target)
      if (Object.isFrozen(object)) Object.freeze(target)
      if (Object.isSealed(object)) Object.seal(target)

      return target
    }

    return clone(object)
  }

  return shim(object, new WeakMap(), new WeakMap())
}
