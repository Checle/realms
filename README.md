# web-assembly

[![Build status](https://img.shields.io/travis/checle/web-assembly/master.svg?style=flat-square)](https://travis-ci.org/checle/web-assembly)

`web-assembly` is an implementation of the [WebAssembly API](http://webassembly.org/docs/js/) for secure execution of ECMAScript. It has a footprint of 5KB and does not depend on the DOM.

`web-assembly` has been designed with efficiency and security in mind. Code is sandboxed purely by means of the JS runtime API. No lexing or parsing is carried out. Security measures are designed to be immune to extensions of the ECMAScript language. The package works in an ES5-compliant manner, making results predictable and security best assessable.

## Installation

Install this package using NPM:

    npm install @record/web-assembly --save-dev

## Usage

```javascript
import WebAssembly from '@record/web-assembly';

let sandbox = {console};

WebAssembly.instantiate('console.log("Hello world")', sandbox);
```

See the [WebAssembly API documentation](http://webassembly.org/docs/js/) for further details.

## Method

`web-assembly` executes scripts synchronously in the global scope. The
package has no dependencies, that is, tertiary APIs such as DOM or Worker
are not involved. Code is not transpiled.

In order to sandbox code and prevent leaks or side-effects, [built-in
objects](https://es5.github.io/#x15.1) are
frozen.
That is, any modifications on properties or sub-properties of built-in
objects (such as `Object.prototype.toString`)
will be discarded (see the behavior of [`Object.freeze()`](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)).

Objects are thoroughly isolated from the host environment.
Variables passed as `importObject` are completely represented in
the sandbox: methods are callable and properties
are recursively accessible. However, changes made to these
properties are not reflected in the host environment.

## Caveats

* Scripts run in _strict mode_ (or a superset, depending on browser support).
* Built-in objects (`Object`, `Array`, `Date` etc.) and their prototypes are immutable.

## License

© 2016 Filip Dalüge, all rights reserved.
