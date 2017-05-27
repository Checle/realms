let vm = require('vm')

const CONTEXT = Symbol('context')
const GLOBAL = Symbol('global')

export class Realm {
  constructor () {
    let context = vm.createContext()
    let global = vm.runInContext('this', context)

    this[CONTEXT] = context
    this[GLOBAL] = global
  }

  get global () {
    return this[GLOBAL]
  }

  eval (code) {
    return vm.runInContext(code, this[CONTEXT])
  }

  spawn (endowments) {
    let child = new Realm()

    Object.setPrototypeOf(child[GLOBAL], this[GLOBAL])
    Object.assign(child[GLOBAL], endowments)
  }
}

export default Realm
