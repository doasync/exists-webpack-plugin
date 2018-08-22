/* eslint-disable no-restricted-syntax */

const util = require('util');
const path = require('path');
const chalk = require('chalk');

const PLUGIN_NAME = 'ExistsWebpackPlugin';

const defaultOptions = {
  paths: undefined,
  mode: undefined,
  onExists: true,
  emitWarning: false,
};

const MODE_ASSETS = 'assets';
const MODE_ENTRIES = 'entries';
const MODE_OUTPUT_PATH = 'output.path';
const MODES = [MODE_ASSETS, MODE_ENTRIES, MODE_OUTPUT_PATH];

const ERROR_OPTION_ERROR = `${PLUGIN_NAME}: specify either "paths" or "mode" option\n`;
const ERROR_OPTION_PATHS = `${PLUGIN_NAME}: "paths" option can only be an array of paths\n`;
const ERROR_OPTION_MODE = `${PLUGIN_NAME}: "mode" option can only be one of the following:\n%s\n`;
const ERROR_PATHS_EXISTS = `${PLUGIN_NAME}: paths exist\n%s\n`;
const ERROR_PATHS_NOT_EXISTS = `${PLUGIN_NAME}: paths do not exist\n%s\n`;

class ExistsWebpackPlugin {
  constructor (options) {
    this.options = Object.freeze({ ...defaultOptions, ...options });
    this.pathsExist = [];
    this.pathsNotExist = [];
  }

  testOptions () {
    const { paths, mode } = this.options;

    // Check for mutually exclusive "paths" and "mode"
    if ((paths && mode) || (!paths && !mode)) {
      throw chalk.red.bold(`ERROR in ${ERROR_OPTION_ERROR}`);
    }

    // Check "paths" value
    if (!mode && !(Array.isArray(paths) && paths.length > 0)) {
      throw chalk.red.bold(ERROR_OPTION_PATHS);
    }

    // Check "mode" value
    if (!paths && !MODES.includes(mode)) {
      throw chalk.red.bold(
        util.format(`ERROR in ${ERROR_OPTION_MODE}`, MODES.join('\n')),
      );
    }
  }

  checkPath (compiler, givenPath) {
    const { fileSystem: fs } = compiler.inputFileSystem;
    const { context } = compiler;
    const relativePath = path.relative(context, givenPath);

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.statSync(givenPath);
      this.pathsExist.push(relativePath);
    } catch (e) {
      this.pathsNotExist.push(relativePath);
    }
  }

  detectError () {
    const { onExists } = this.options;

    // Error if paths exist
    if (onExists === true && this.pathsExist.length) {
      this.error = util.format(ERROR_PATHS_EXISTS, this.pathsExist.join('\n'));
    }

    // Error if paths do not exist
    if (onExists === false && this.pathsNotExist.length) {
      this.error = util.format(ERROR_PATHS_NOT_EXISTS, this.pathsNotExist.join('\n'));
    }
  }

  apply (webpack) {
    webpack.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      const { paths, mode, emitWarning } = this.options;

      // Check plugin options, throw on error
      try {
        this.testOptions();
      } catch (error) {
        callback(error);
        return;
      }

      // Check if output.path exists
      if (mode === MODE_OUTPUT_PATH) {
        const { output } = compiler.options;
        this.checkPath(compiler, output.path);
      }

      // Check if custom paths exist
      if (paths && paths.length) {
        for (const customPath of paths) {
          this.checkPath(compiler, customPath);
        }
      }

      // Validate paths and get error message
      this.detectError();

      // Fail on error
      if (this.error && !emitWarning) {
        callback(chalk.red.bold(`ERROR in ${this.error}`));
        return;
      }

      // Everything is ok
      callback();
    });

    webpack.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      const { compiler, assets } = compilation;
      const { path: outputPath } = compilation.outputOptions;

      const { mode, emitWarning } = this.options;

      // Check if assets exist
      if (mode === MODE_ASSETS) {
        for (const asset of Object.keys(assets)) {
          this.checkPath(compiler, `${outputPath}/${asset}`);
        }
      }

      // Check if entries exist
      if (mode === MODE_ENTRIES) {
        const entries = [...compilation.entrypoints.values()];

        for (const entry of entries) {
          for (const chunk of entry.chunks) {
            for (const file of chunk.files) {
              this.checkPath(compiler, `${outputPath}/${file}`);
            }
          }
        }
      }

      // Validate paths and get error message
      this.detectError();

      // Emit warning or fail
      if (this.error) {
        if (emitWarning) {
          compilation.warnings.push(this.error);
        } else {
          compilation.errors.push(this.error);
          return false;
        }
      }

      // Everything is ok
      return true;
    });
  }
}

module.exports = ExistsWebpackPlugin;
