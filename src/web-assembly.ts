import evaluate from './eval'
import {isIdentifier} from './eval'

export const NativeError = 'NativeError' in global ? global['NativeError'] as ErrorConstructor : Error

function toString (bytes: BufferSource | string): string {
  if (typeof bytes === 'string') return bytes

  bytes = toUint8Array(bytes)

  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes)
  }

  return String.fromCharCode.apply(null, bytes)
}

function toUint8Array (bytes: BufferSource): ArrayBuffer | ArrayBufferView {
  if (bytes instanceof Uint8Array) {
    return bytes
  }

  if (!(bytes instanceof ArrayBuffer)) {
    bytes = bytes.buffer
  }

  return new Uint8Array(bytes)
}

function isWASM (bytes: any): boolean {
  bytes = toUint8Array(bytes)

  return bytes[0] === 0
}


export type ResultObject = WebAssembly.ResultObject
export type BufferSource = ArrayBuffer | ArrayBufferView

export class CompileError extends NativeError { }
export class RuntimeError extends NativeError { }
export class LinkError extends NativeError { }

export class Module implements WebAssembly.Module {
  static exports (module: Module) {
    if (module instanceof WebAssembly.Module) {
      return WebAssembly.Module.exports(module)
    }

    return []
  }
  static imports (module: Module) {
    if (module instanceof WebAssembly.Module) {
      return WebAssembly.Module.imports(module)
    }

    return []
  }

  routine: Function
  evaluator: Function

  constructor (bytes: BufferSource | string) {
    if (isWASM(bytes)) {
      return new WebAssembly.Module(bytes as any) as Module
    }

    let code = toString(bytes)

    try {
      let [evaluator, routine] = evaluate('[function(){eval(arguments[0])},function(){try{' + code + '}finally{return function(){eval(arguments[0])}}}}]')

      this.evaluator = evaluator
      this.routine = routine
    } catch (error) {
      throw new CompileError(error as string)
    }
  }
}

export class Instance implements WebAssembly.Instance {
  module: Module
  exports: any

  constructor (module: Module, imports?: any) {
    if (!(module instanceof Module)) {
      return new WebAssembly.Instance(module, imports) as Instance
    }

    try {
      let symbols = imports ? Object.keys(imports).filter(name => isIdentifier(name)) : []
      let enter = symbols.map(name => 'try{' + name + '=this.' + name + '}catch(e){}')
      let exit = symbols.map(name => 'try{if(' + name + '!==undefined)this.' + name + '=' + name + '}catch(e){}')
      let exports = Object.assign({}, imports)

      module.evaluator.call(exports, enter)

      let evaluator = module.routine.call(exports, imports)

      evaluator.call(exports, exit)

      for (let name in exports) {
        Object.defineProperty(exports, name, {value: exports[name]})
      }

      Object.freeze(exports)

      this.module = module
      this.exports = exports
    } catch (error) {
      throw new RuntimeError(error as string)
    }
  }
}

export function validate (bytes: BufferSource | string): boolean {
  if (isWASM(bytes)) {
    return WebAssembly.validate(bytes as any)
  }

  try {
    new Function(toString(bytes))

    return true
  } catch (e) {
    return false
  }
}

export async function compile (bytes: BufferSource | string): Promise<Module> {
    return await new Module(bytes)
}

export async function instantiate (bytes: BufferSource | string, imports?: any): Promise<ResultObject> {
  if (isWASM(bytes)) {
    return WebAssembly.instantiate(bytes as any)
  }

  let module = await compile(bytes)
  let instance = new Instance(module, imports)

  return {module, instance}
}
