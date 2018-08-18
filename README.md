![exists-webpack-plugin logo](https://i.imgur.com/EfWTYNQ.png)

[![NPM Version][npm-image]][npm-url] ![NPM Downloads][downloads-image] [![GitHub issues][issues-image]][issues-url] [![Telegram][telegram-image]][telegram-url]

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

This plugin returns an error (or warning) if specified paths exist (or not exist).
Webpack skips the emitting phase whenever there is an error from this plugin.
This helps to force the developer to change dist folder and do not overwrite files.
The plugin supports the following modes:

1. Check any custom files or folders if they are exist
2. Check if output folder exists (to stop Webpack early)
3. Check if any emitted assets already exist (to prevent overwriting them)
4. Check files of entry points only (to prevent running the same config twice, but ignore other assets)
5. Do the same above checks but if files don't exist
6. Show just warnings instead of errors and let Webpack finish the build

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

The example above emits an error and stops Webpack if `output.path` from your configuration already exists.

Options
-------------------

#### Default options
```js
{
  paths: undefined,
  mode: undefined,
  onExists: true,
  emitWarning: false,
};
```

#### `paths` (array: `undefined`)

An array of paths that you want to check for existence.
You can use paths relative to your current directory.
You should specify either `paths` or `mode`.

#### `mode` (string: `output.path` | `assets` | `entries`)

###### `output.path`
Check for `output.path` (from Webpack config)

###### `assets`
Check generated assets

###### `entries`
Check entry points only

#### `onExists` (boolean: `true`)

A boolean value to specify when to emit an error. If you want it when your path do not exist, set this option to `false`.

#### `emitWarning` (boolean: `false`)

By default this plugin will emit an error if the path exists (or not). You can emit a warning instead by setting this option to `true`.
The build process will not fail in this case and your assets will be overwritten.
