class Realm {
  constructor () {
    throw new Error('Not impemented')
  }
}

if (typeof require === 'function') {
  let path

  try {
    path = require.resolve('./realm/node')
  } catch (e) { }

  if (path !== undefined) {
    Realm = require(path).Realm
  }
}

export {Realm}
export default Realm
