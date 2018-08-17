
const util = require('util');
const chalk = require('chalk');

const PLUGIN_NAME = 'ExistsWebpackPlugin';
const ERROR_OPTION_PATH = `${PLUGIN_NAME}: specify either "path" or "outputPath" option\n`;
const ERROR_PATH_EXISTS = `${PLUGIN_NAME}: path exists\n%s\n`;
const ERROR_PATH_NOT_EXISTS = `${PLUGIN_NAME}: path do not exist\n%s\n`;

const defaultOptions = {
  path: undefined,
  outputPath: false,
  onExists: true,
  emitWarning: false,
  failOnError: false,
};

class ExistsWebpackPlugin {
  constructor (options) {
    this.options = Object.freeze(Object.assign(defaultOptions, options));
  }

  apply (webpack) {
    webpack.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      const { output } = compiler.options;
      const { fileSystem: fs } = compiler.inputFileSystem;

      const {
        path,
        outputPath,
        onExists,
        failOnError,
      } = this.options;

      if ((path && outputPath) || (!path && !outputPath)) {
        callback(chalk.red.bold(`ERROR in ${ERROR_OPTION_PATH}`));
        return;
      }

      const checkPath = outputPath ? output.path : path;

      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.statSync(checkPath);
        this.exists = true;
      } catch (e) {
        this.exists = false;
      }

      if (onExists === this.exists) {
        const message = onExists ? ERROR_PATH_EXISTS : ERROR_PATH_NOT_EXISTS;
        this.error = util.format(message, checkPath);
      }

      if (failOnError && this.error) {
        callback(chalk.red.bold(`ERROR in ${this.error}`));
        return;
      }

      callback();
    });

    webpack.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if (this.error) {
        const { emitWarning } = this.options;
        const reportingMode = emitWarning ? 'warnings' : 'errors';
        // eslint-disable-next-line security/detect-object-injection
        compilation[reportingMode].push(this.error);
      }
    });
  }
}

module.exports = ExistsWebpackPlugin;
