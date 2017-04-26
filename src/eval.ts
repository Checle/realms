import {global, freeze, preventExtensions, clone} from './object'

const BuiltIns = new Set(['Array', 'ArrayBuffer', 'Atomics', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError',
  'Float32Array', 'Float64Array', 'Function', 'Generator', 'GeneratorFunction', 'Infinity', 'Int16Array', 'Int32Array',
  'Int8Array', 'InternalError', 'Iterator', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'ParallelArray',
  'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'SharedArrayBuffer', 'StopIteration',
  'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError', 'Uint16Array', 'Uint32Array', 'Uint8Array',
  'Uint8ClampedArray', 'WeakMap', 'WeakSet', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
  'escape', 'eval', 'arguments', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'])

// TODO: secure eval

export function isBuiltIn (name: string): boolean {
  return BuiltIns.has(name)
}

export function isIdentifier (name: string): boolean {
  // Test if identifier is a valid variable name
  try {
    // Strip operators, control characters and ASCII white-space
    eval('var ' + name.replace(/(?![$\w])[\0-\x7F]/g, ''))
  } catch (e) {
    return  false
  }
  return true
}

export function getIdentifiers (code: string): string[] {
  let pattern = /(?:[$\w]|[^\0-\x7F])+/g
  let identifiers = {}
  let match: any[]

  while ((match = pattern.exec(code))) {
    let sequence = match[0]
    let end = 0

    if (!/[^$\w]/.test(sequence)) {
      identifiers[sequence] = true
      continue
    }

    for (let offset = 0; offset < sequence.length; offset = end) {
      try {
        eval('var ' + sequence[offset])

        for (end = offset + 1; end < sequence.length; end++) {
          try { eval('var _' + sequence[end]) }
          catch (e) { break }
        }

        identifiers[sequence.substring(offset, end)] = true
      } catch (e) { end++ }
    }
  }

  return Object.getOwnPropertyNames(identifiers).filter(name => { try { new Function('var ' + name) } catch (e) { return false } return true })
}

export default function evaluate (code: string, thisArg?, ...args) {
  // Deep-freeze all builtin objects
  for (let name of BuiltIns) {
    freeze(global[name])
  }

  // Seal the global scope
  preventExtensions(global)

  // Collect names
  let names = []

  for (let object = global; object != null && object !== Object.prototype; object = Object.getPrototypeOf(object)) {
    names = names.concat(Object.getOwnPropertyNames(object))
  }

  // Filter out invalid identifier patterns
  names = names.filter(isIdentifier)

  // Collect identifiers
  names = names.concat(getIdentifiers(code))

  // Filter out built-ins
  names = names.filter(name => !isBuiltIn(name))

  let evaluate = new Function("'use strict';" + (names.length ? 'var ' + names.join(',') + ';' : '') + 'return eval(Array.prototype.shift.call(arguments))')

  return clone(evaluate.call(thisArg, code, ...args))
}
