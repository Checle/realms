import {global, freeze, clone, preventExtensions} from './object'

const BuiltIns = ['Array', 'ArrayBuffer', 'Atomics', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError',
  'Float32Array', 'Float64Array', 'Function', 'Generator', 'GeneratorFunction', 'Infinity', 'Int16Array', 'Int32Array',
  'Int8Array', 'InternalError', 'Iterator', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'ParallelArray',
  'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'SharedArrayBuffer', 'StopIteration',
  'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError', 'Uint16Array', 'Uint32Array', 'Uint8Array',
  'Uint8ClampedArray', 'WeakMap', 'WeakSet', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
  'escape', 'eval', 'arguments', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape']

export function isIdentifier (name: string): boolean {
  // Exclude operators, control characters and ASCII white-space
  if (/(?![$\w])[\0-\x7F]/.test(name)) {
    return false
  }

  // Test if identifier is a valid variable name
  try {
    eval('var ' + name)
  } catch (e) {
    return  false
  }

  return true
}

export default function evaluate (code: string, thisArg?, ...args) {
  if (new Function('return eval("function(){return this}()")')() !== null) {
    throw new EvalError('Strict mode is not supported')
  }

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

  // Separate eval from the local scope, bind built-in identifiers
  let functionString = 'function Function(){return eval("(function("+Array.prototype.slice.call(arguments,0,-1).join(",")+"){"+arguments[arguments.length-1]+"})")}'
  let evaluate = new Function('return (function(' + BuiltIns.join(',') + '){' + (names.length ? 'var ' + names.join(',') + ';' : '') + 'return function(){' + functionString + 'return eval(Array.prototype.shift.call(arguments))}})(' + BuiltIns.join(',') + ')')

  return clone(evaluate.call(thisArg, code, ...args))
}
