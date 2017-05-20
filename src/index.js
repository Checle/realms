import Realm from './realm.js'

try {
  Realm = require('./node.js').Realm
} catch (e) { }

export {Realm}
