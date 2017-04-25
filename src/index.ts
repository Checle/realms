import {createContext, Context, Script} from './vm'

function toString (bytes: BufferSource): string {
  if (typeof bytes === 'string') return bytes

  bytes = toUint8Array(bytes)

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

function isWASM (bytes: BufferSource): boolean {
  bytes = toUint8Array(bytes)

  return bytes[0] === 0
}


export type ResultObject = WebAssembly.ResultObject
export type BufferSource = ArrayBuffer | ArrayBufferView

export declare var NativeError: ErrorConstructor

if (!('NativeError' in global)) global['NativeError'] = Error

export class CompileError extends NativeError { }
export class RuntimeError extends NativeError { }
export class LinkError extends NativeError { }

export class Module implements WebAssembly.Module {
  script: Script

  constructor (bytes: BufferSource) {
    if (isWASM(bytes)) {
      return new WebAssembly.Module(bytes as any) as Module
    }

    try {
      this.script = new Script(toString(bytes))
    } catch (error) {
      throw new CompileError(error as string)
    }
  }
}

export class Instance implements WebAssembly.Instance {
  context: Context
  module: Module

  exports = {}

  constructor (module: Module, importObject?: any) {
    if (module instanceof WebAssembly.Module) {
      return new WebAssembly.Instance(module, importObject) as Instance
    }

    try {
      this.context = createContext(importObject)
      this.module = module
    } catch (error) {
      throw new LinkError(error as string)
    }

    try {
      let result = this.module.script.runInContext(this.context) || this.context

      this.exports = result
    } catch (error) {
      throw new RuntimeError(error as string)
    }
  }
}

export function validate (bytes: BufferSource): boolean {
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

export async function compile (bytes: BufferSource): Promise<Module> {
    return await new Module(bytes)
}

export async function instantiate (bytes: BufferSource, importObject?: any): Promise<ResultObject> {
  if (isWASM(bytes)) {
    return WebAssembly.instantiate(bytes as any)
  }

  let module = await compile(bytes)
  let instance = new Instance(module, importObject)

  return {module, instance}
}
