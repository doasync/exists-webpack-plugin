![exists-webpack-plugin logo](https://i.imgur.com/CH8iInH.png)

[![NPM Version][npm-image]][npm-url] ![NPM Downloads][downloads-image] [![GitHub issues][issues-image]][issues-url] [![Telegram][telegram-image]][telegram-url] [![Tweet][twitter-image]][twitter-url]

[npm-image]: https://img.shields.io/npm/v/exists-webpack-plugin.svg
[npm-url]: https://www.npmjs.com/package/exists-webpack-plugin
[downloads-image]: https://img.shields.io/npm/dw/exists-webpack-plugin.svg
[deps-image]: https://david-dm.org/doasync/exists-webpack-plugin.svg
[issues-image]: https://img.shields.io/github/issues/doasync/exists-webpack-plugin.svg
[issues-url]: https://github.com/doasync/exists-webpack-plugin/issues
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/doasync/exists-webpack-plugin/master/LICENSE
[telegram-image]: http://i.imgur.com/WANXk3d.png
[telegram-url]: https://t.me/doasync

Exists Webpack Plugin
===================

This plugin emits an error (or warning) or fails the build if `output.path` or custom path (folder or file) exists (or not exists).

----------

Installation
-------------

```bash
npm i --save-dev exists-webpack-plugin
```

Usage
-------------------

In your webpack configuration

```js
module.exports = {
  // ...
  plugins: [
    new ExistsWebpackPlugin({
      outputPath: true,
    }),
  ],
  // ...
}
```

The example above emits an error if `output.path` from Webpack configuration already exists.
You can also add `failOnError: true` option to fail early. This helps to force developer
to change dist folder somehow and do not overwrite files.

Options
-------------------

#### Default options
```js
{
  path: undefined,
  outputPath: false,
  onExists: true,
  emitWarning: false,
  failOnError: false,
}
```

#### `path` (string: `undefined`)

Yo can specify a custom path to the folder or file you want to check
if it exists or not. Webpack's `fs.statSync` is used,
so you can use paths relative to your current directory.
The check is done in `beforeRun` hook. You should specify either
this option or `outputPath`.

#### `outputPath` (boolean: `false`)

Set it to `true` if you want to check for `output.path` (from Webpack config).

#### `onExists` (boolean: `true`)

When to emit an error. If you want it when your path exists, set this option to `true`.

#### `emitWarning` (boolean: false)

By default this plugin will emit an error if the path exists. You can set this option to `true` in order to emit warnings.

#### `failOnError` (boolean: false)

The plugin will cause the build to fail if there is an error or warning.

## Gotchas

### noEmitOnErrors

Webpack configuration option `optimization.noEmitOnErrors` prevents webpack
from outputting anything into a bundle. Webpack skips the emitting
phase whenever there are errors while compiling. This ensures that
no erroring assets are emitted. You can alternatively use `failOnError` option
of this plugin to prevent creating any files.