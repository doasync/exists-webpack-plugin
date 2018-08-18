
const util = require('util');
const path = require('path');
const chalk = require('chalk');

const PLUGIN_NAME = 'ExistsWebpackPlugin';

const ERROR_OPTION_ERROR = `${PLUGIN_NAME}: specify either "paths" or "mode" option\n`;
const ERROR_OPTION_PATHS = `${PLUGIN_NAME}: "paths" option can only be an array of paths\n`;
const ERROR_OPTION_MODE = `${PLUGIN_NAME}: "mode" option can only be one of the following:\n%s\n`;
const ERROR_PATHS_EXISTS = `${PLUGIN_NAME}: paths exist\n%s\n`;
const ERROR_PATHS_NOT_EXISTS = `${PLUGIN_NAME}: paths do not exist\n%s\n`;

const MODE_ASSETS = 'assets';
const MODE_ENTRIES = 'entries';
const MODE_OUTPUT_PATH = 'output.path';
const MODES = [MODE_ASSETS, MODE_ENTRIES, MODE_OUTPUT_PATH];

const defaultOptions = {
  paths: undefined,
  mode: undefined,
  onExists: true,
  emitWarning: false,
};

class ExistsWebpackPlugin {
  constructor (options) {
    this.options = Object.freeze(Object.assign(defaultOptions, options));
    this.pathsExist = [];
    this.pathsNotExist = [];
  }

  apply (webpack) {
    webpack.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      const { output } = compiler.options;
      const { fileSystem: fs } = compiler.inputFileSystem;
      const { context } = compiler;

      const {
        paths,
        mode,
        onExists,
        emitWarning,
      } = this.options;

      if ((paths && mode) || (!paths && !mode)) {
        callback(chalk.red.bold(`ERROR in ${ERROR_OPTION_ERROR}`));
        return;
      }

      if (!mode && !(Array.isArray(paths) && paths.length > 0)) {
        callback(chalk.red.bold(ERROR_OPTION_PATHS));
        return;
      }

      if (!paths && !MODES.includes(mode)) {
        callback(chalk.red.bold(
          util.format(`ERROR in ${ERROR_OPTION_MODE}`, MODES.join('\n')),
        ));
        return;
      }

      if (mode === MODE_OUTPUT_PATH) {
        const relativePath = path.relative(context, output.path);
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.statSync(output.path);
          this.pathsExist.push(relativePath);
        } catch (e) {
          this.pathsNotExist.push(relativePath);
        }
      }

      if (paths && paths.length) {
        for (const customPath of paths) {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.statSync(customPath);
            this.pathsExist.push(customPath);
          } catch (e) {
            this.pathsNotExist.push(customPath);
          }
        }
      }

      if (onExists === true && this.pathsExist.length) {
        this.error = util.format(ERROR_PATHS_EXISTS, this.pathsExist.join('\n'));
      }

      if (onExists === false && this.pathsNotExist.length) {
        this.error = util.format(ERROR_PATHS_NOT_EXISTS, this.pathsNotExist.join('\n'));
      }

      if (!emitWarning && this.error) {
        callback(chalk.red.bold(`ERROR in ${this.error}`));
        return;
      }

      callback();
    });

    webpack.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      const { assets } = compilation;
      const { fileSystem: fs } = compilation.inputFileSystem;
      const { path: outputPath } = compilation.outputOptions;
      const { context } = compilation.compiler;

      const {
        mode,
        onExists,
        emitWarning,
      } = this.options;

      if (mode === MODE_ASSETS) {
        for (const asset of Object.keys(assets)) {
          const assetPath = `${outputPath}/${asset}`;
          const relativePath = path.relative(context, assetPath);
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.statSync(assetPath);
            this.pathsExist.push(relativePath);
          } catch (e) {
            this.pathsNotExist.push(relativePath);
          }
        }
      }

      if (mode === MODE_ENTRIES) {
        const entries = [...compilation.entrypoints.values()];

        for (const entry of entries) {
          for (const chunk of entry.chunks) {
            for (const file of chunk.files) {
              const filePath = `${outputPath}/${file}`;
              const relativePath = path.relative(context, filePath);
              try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.statSync(filePath);
                this.pathsExist.push(relativePath);
              } catch (e) {
                this.pathsNotExist.push(relativePath);
              }
            }
          }
        }
      }

      if (onExists === true && this.pathsExist.length) {
        this.error = util.format(ERROR_PATHS_EXISTS, this.pathsExist.join('\n'));
      }

      if (onExists === false && this.pathsNotExist.length) {
        this.error = util.format(ERROR_PATHS_NOT_EXISTS, this.pathsNotExist.join('\n'));
      }

      if (this.error) {
        const reportingMode = emitWarning ? 'warnings' : 'errors';
        // eslint-disable-next-line security/detect-object-injection
        compilation[reportingMode].push(this.error);
        if (!emitWarning) {
          return false;
        }
      }

      return true;
    });
  }
}

module.exports = ExistsWebpackPlugin;
