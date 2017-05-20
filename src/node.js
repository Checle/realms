import {freeze} from './object.js'

let vm = require('vm')

const CONTEXT = Symbol('context')
const GLOBAL = Symbol('global')
const IS_SHADOW = Symbol('isShadow')
const ROOT = Symbol('root')

export class Realm {
  constructor () {
    throw new TypeError('Cannot directly invoke Realm')
  }

  get global () {
    return this[GLOBAL]
  }

  eval (code) {
    return vm.runInContext(code, this[CONTEXT])
  }

  spawn (endowments) {
    let realm = Realm.immutableRoot()

    if (endowments != null) Object.assign(realm, endowments)

    return realm
  }

  static immutableRoot () {
    let realm = Object.create(Realm.prototype)
    let context = vm.createContext()
    let global = vm.runInNewContext('this', context)
    let {Date} = global

    global.Date = class Date {
      constructor () {
        if (arguments.length === 0) throw new TypeError('Argument expected')

        return new Date(...arguments)
      }
    }

    delete global.Math.now

    let descriptors = Object.getOwnPropertyDescriptors(Date)

    delete descriptors.now

    Object.defineProperties(Date, descriptors)
    Object.defineProperty(global.Object.prototype, '__proto__', {value: undefined})
    Object.freeze(context)

    for (let name of Object.getOwnPropertyNames(global)) {
      freeze(global[name])
    }

    realm[CONTEXT] = context
    realm[GLOBAL] = global
    realm[ROOT] = realm

    return realm
  }
}
