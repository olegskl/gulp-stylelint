/**
 * Gulp stylelint plugin.
 * @module gulp-stylelint
 */

import {formatters, lint} from 'stylelint';
import PluginError from 'plugin-error';
import through from 'through2';
import Promise from 'promise';
import deepExtend from 'deep-extend';
import reporterFactory from './reporter-factory';
import applySourcemap from './apply-sourcemap';

/**
 * Name of this plugin for reporting purposes.
 * @type {String}
 */
const pluginName = 'gulp-stylelint';

/**
 * Stylelint results processor.
 * @param {Object} [options] - Plugin options.
 * @param {String} [options.reportOutputDir] - Common path for all reporters.
 * @param {[Object]} [options.reporters] - Reporter configurations.
 * @param {Boolean} [options.debug] - If true, error stack will be printed.
 * @return {Stream} Object stream usable in Gulp pipes.
 */
module.exports = function gulpStylelint(options) { // eslint-disable-line max-statements

  /**
   * Plugin options with defaults applied.
   * @type Object
   */
  const pluginOptions = deepExtend({
    failAfterError: true,
    debug: false
  }, options);

  /**
   * Lint options for stylelint's `lint` function.
   * @type Object
   */
  const lintOptions = deepExtend({}, options);

  /**
   * List of gulp-stylelint reporters.
   * @type [Function]
   */
  const reporters = (pluginOptions.reporters || [])
    .map(config => reporterFactory(config, pluginOptions));

  /**
   * List of stylelint's lint result promises.
   * @type [Promise]
   */
  const lintPromiseList = [];

  // Remove the stylelint options that cannot be used:
  delete lintOptions.files; // css code will be provided by gulp instead
  delete lintOptions.formatter; // formatters are defined in the `reporters` option
  delete lintOptions.cache; // gulp caching should be used instead
  delete lintOptions.fix; // FIXME: wait for stylelint support

  // Remove gulp-stylelint options so that they don't interfere with stylelint options:
  delete lintOptions.reportOutputDir;
  delete lintOptions.reporters;
  delete lintOptions.debug;

  /**
   * Launches linting of a given file, pushes promises to the promise list.
   *
   * Note that the files are not modified and are pushed
   * back to their pipes to allow usage of other plugins.
   *
   * @param {File} file - Piped file.
   * @param {String} encoding - File encoding.
   * @param {Function} done - File pipe completion callback.
   * @return {undefined} Nothing is returned (done callback is used instead).
   */
  function onFile(file, encoding, done) {

    if (file.isNull()) {
      done(null, file);
      return;
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(pluginName, 'Streaming is not supported'));
      done();
      return;
    }

    const localLintOptions = deepExtend({}, lintOptions, {
      code: file.contents.toString(),
      codeFilename: file.path
    });

    const lintPromise = file.sourceMap ?
      lint(localLintOptions).then(lintResult => applySourcemap(lintResult, file.sourceMap)) :
      lint(localLintOptions);

    lintPromiseList.push(lintPromise);

    done(null, file);
  }

  /**
   * Provides Stylelint result to reporters.
   * @param {[Object]} lintResults - Stylelint results.
   * @return {Promise} Resolved with original lint results.
   */
  function passLintResultsThroughReporters(lintResults) {
    const warnings = lintResults
      .reduce((accumulated, res) => accumulated.concat(res.results), []);
    return Promise
      .all(reporters.map(reporter => reporter(warnings)))
      .then(() => lintResults);
  }

  /**
   * Determines if the severity of a stylelint warning is "error".
   * @param {Object} warning - Stylelint results warning.
   * @return {Boolean} True if warning's severity is "error", false otherwise.
   */
  function isErrorSeverity(warning) {
    return warning.severity === 'error';
  }

  /**
   * Resolves promises and provides accumulated report to reporters.
   * @param {Function} done - Stream completion callback.
   * @return {undefined} Nothing is returned (done callback is used instead).
   */
  function onStreamEnd(done) {
    Promise
      .all(lintPromiseList)
      .then(passLintResultsThroughReporters)
      .then(lintResults => {
        process.nextTick(() => {
          const errorCount = lintResults.reduce((sum, res) => {
            const errors = res.results[0].warnings.filter(isErrorSeverity);
            return sum + errors.length;
          }, 0);
          if (pluginOptions.failAfterError && errorCount > 0) {
            const errorMessage = `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`;
            this.emit('error', new PluginError(pluginName, errorMessage));
          }
          done();
        });
      })
      .catch(error => {
        process.nextTick(() => {
          this.emit('error', new PluginError(pluginName, error, {
            showStack: Boolean(pluginOptions.debug)
          }));
          done();
        });
      });
  }

  return through.obj(onFile, onStreamEnd).resume();
};

/**
 * Formatters bundled with stylelint by default.
 *
 * User may want to see the list of available formatters,
 * proxy them or pass them as functions instead of strings.
 *
 * @see https://github.com/olegskl/gulp-stylelint/issues/3#issuecomment-197025044
 * @type {Object}
 */
module.exports.formatters = formatters;
