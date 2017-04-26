# web-assembly

[![NPM](https://img.shields.io/npm/v/@checle/web-assembly.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/@checle/web-assembly)
[![Dependencies](https://img.shields.io/david/checle/web-assembly.svg?maxAge=2592000&style=flat-square)](https://david-dm.org/checle/web-assembly)
[![Build status](https://img.shields.io/travis/checle/web-assembly/master.svg?style=flat-square)](https://travis-ci.org/checle/web-assembly)
[![Coding style](https://img.shields.io/badge/code%20style-standard-blue.svg?style=flat-square)](http://standardjs.com/)

`web-assembly` is an implementation of the [WebAssembly API](https://nodejs.org/api/vm.html) for secure execution of ECMAScript. It has a footprint of 5KB and does not depend on the DOM.

`web-assembly` has been designed with efficiency and security in mind. Code is sandboxed purely by means of the runtime API. No lexing or parsing is carried out. Security measures are designed to be immune to extensions of the ECMAScript language. The package works with standardized ECMAScript features only, making results predictable and security assessable.

## Installation

Install this package using NPM:

    npm install @checle/web-assembly --save-dev

## Usage

```javascript
import WebAssembly from '@checle/web-assembly';

let sandbox = {console};

WebAssembly.instantiate('console.log("Hello world")', sandbox);
```

See the [WebAssembly API documentation](http://webassembly.org/docs/js/) for further details.

## Method

`web-assembly` executes scripts synchronously in the global scope. No
overhead such as instantiating an `iframe` or Web Worker is involved.
Code is not transpiled.

In order to sandbox code from the environment, [built-in
objects](https://es5.github.io/#x15.1) are
frozen and the global object is sealed.
Any modifications on properties or sub-properties of built-in
objects (such as `Object.prototype.toString`)
will be discarded (see the behavior of [`Object.freeze()`](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)).

Objects are thoroughly isolated from the host environment.
Variables passed as `importObject` are completely represented in
the sandbox: methods are callable and properties
are recursively accessible. However, changes made to these
properties are not reflected in the host environment.

## Caveats

* Scripts run in _strict mode_ (or a superset, depending on browser support).
* Built-in objects (`Object`, `Array`, `Date` etc.), their prototypes and the global object are immutable.

## License

© 2016 Filip Dalüge, all rights reserved.
