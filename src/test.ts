import * as test from 'tape'
import {validate, compile, instantiate, Module, Instance, CompileError} from './index'

test('validate()', t => {
  t.notOk(validate('var function'))
  t.ok(validate('var x'))
  t.end()
})
/*
test('compile()', t => {
  t.throws(() => compile('var function'), CompileError)
  t.doesNotThrow(() => compile('x * 123'))
  t.ok(compile('var x') instanceof Module)
  t.end()
})
test('instantiate()', t => {
  let imports = {toast: "true"}
  let code = `
    this.foo = "bar"
    this.typeofConsole = typeof console
    this.typeofObject = typeof Object
    if (toast !== "true") throw new Error()
    toast = "false"
    vmResult = "foo"
  `
  let promise

  t.doesNotThrow(() => promise = instantiate(code, imports))
  promise.then(result => {
    let {module, instance} = result

    let exports = instance.exports

    t.ok(module instanceof Module)
    t.ok(instance instanceof Instance)
    t.deepEqual(exports, {
      foo: 'bar',
      typeofConsole: 'undefined',
    })
    t.ok(imports.toast !== "false")
    t.ok(exports.toast !== "false")
    t.equal(global['vmResult'], undefined)
    t.end()
  }).catch(error => t.error()).then(() => t.end())
})

test('runInContext()', (t) => {
  let sandbox = { foo: 'bar' }
  let context = vm.createContext(sandbox)
  let result = vm.runInContext(
    'this.baz = foo; this.typeofConsole = typeof console; typeof Object',
    context
  )
  t.deepEqual(sandbox, {
    foo: 'bar',
    baz: 'bar',
    typeofConsole: 'undefined',
  })
  t.equal(result, 'function')

  t.end()
})

test('runInThisContext()', (t) => {
  let result = vm.runInThisContext(
    'this.vmResult = "foo"; Object.prototype.toString.call(console)'
  )
  t.equal(global['vmResult'], 'foo')
  t.equal(result, '[object console]')
  delete global['vmResult']

  t.end()
})

test('createContext()', (t) => {
  let sandbox = {}
  let context = vm.createContext(sandbox)
  t.equal(sandbox, context)

  t.end()
})
*/
