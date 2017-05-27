import {freeze} from '../object.js'
import {Realm} from '../realm.js'

const GLOBAL = Symbol('GLOBAL')

Realm.immutableRoot = function immutableRoot () {
  if (immutableRoot !== null) return immutableRoot

  immutableRoot = new FrozenRealm()

  return immutableRoot
}

export class FrozenRealm extends Realm {
  constructor (options) {
    super(options)

    let global = this.global
    let {Date} = global

    global.Date = class Date {
      constructor () {
        if (arguments.length === 0) throw new TypeError('Argument expected')

        return new Date(...arguments)
      }
    }

    delete global.Math

    let descriptors = Object.getOwnPropertyDescriptors(Date)

    delete descriptors.now

    Object.defineProperties(Date, descriptors)

    freeze(global)
  }

  spawn (endowments) {
    let realm = Object.create(Realm.prototype)
    let global = Object.create(this[GLOBAL])
    let context = this[CONTEXT]

    Object.assign(global, endowments)

    do {
      names = names.concat(Object.getOwnPropertyNames(current))

      current = Object.getPrototypeOf(current)
    } while (current !== null)

    names = names.filter(isIdentifier).filter(name => name !== 'eval' && name !== 'arguments')

    let code = ''

    code += names.map(name => 'var ' + name + '=this.' + name + ';').join('')
    code += '(function(code){"use strict";return eval(code)}).bind(this[""])'

    Object.setPrototypeOf(context, global)

    context[''] = global

    let evaluate

    try {
      evaluate = vm.runInContext(code, context)
    } finally {
      context[''] = null

      Object.setPrototypeOf(context, Object.prototype)
    }

    realm[GLOBAL] = global
    realm[EVAL] = evaluate

    return realm
  }
}

export default FrozenRealm
