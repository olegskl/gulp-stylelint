/**
 * Gulp stylelint plugin.
 * @module gulp-stylelint
 */

import postcss from 'postcss';
import stylelint from 'stylelint';
import gulpUtil from 'gulp-util';
import through from 'through2';

/**
 * Name of this plugin for reporting purposes.
 * @type {String}
 */
const pluginName = 'gulp-stylelint';

/**
 * Stylelint results processor.
 * @param  {Object}          [options]           Plugin options.
 * @param  {Object}          [options.stylelint] Stylelint options (omit to use .stylelintrc).
 * @param  {Array<Function>} [options.reporters] List of reporters with sequential execution.
 * @param  {Boolean}         [options.debug]     If set to true, error stack trace will be printed.
 * @return {Stream}                              Object stream usable in Gulp pipes.
 */
export default function gulpStylelint(options = {}) {
  const promiseList = [];
  const postcssProcessor = postcss([stylelint(options.stylelint)]);

  /**
   * Launches processing of a given file and adds it to the promise list.
   *
   * Note that the files are not modified and are pushed
   * back to their pipes to allow usage of other plugins.
   *
   * @param  {File}      file      Piped file.
   * @param  {String}    encoding  File encoding.
   * @param  {Function}  done      Done callback.
   * @return {undefined}           Nothing is returned (done callback is used instead).
   */
  function onFile(file, encoding, done) {

    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      return done(new gulpUtil.PluginError(pluginName, 'Streaming not supported'));
    }

    const fileContents = file.contents.toString();
    const promise = postcssProcessor.process(fileContents, {from: file.path});

    promiseList.push(promise);

    done(null, file);
  }

  /**
   * Provides Stylelint results to reporters and awaits their response.
   * @param  {Array<Object>} results List of results in Stylelint format.
   * @return {Promise}               Accumulated result of reporters execution.
   */
  function provideResultsToReporters(results) {

    /**
     * Reducer for sequential execution of reporters.
     * @param  {Promise}  promise  Accumulated promise (initial value in reducer).
     * @param  {Function} reporter Reporter function.
     * @return {Promise}           Reporter execution promise.
     */
    function reporterListReducer(promise, reporter) {
      return promise.then(() => reporter(results));
    }

    return (options.reporters || [])
      .reduce(reporterListReducer, Promise.resolve());
  }

  /**
   * Resolves accumulated promises and writes report to file system.
   * @param  {Function}  done Done callback.
   * @return {undefined}      Nothing is returned (done callback is used instead).
   */
  function onStreamEnd(done) {
    Promise
      .all(promiseList)
      .then(provideResultsToReporters)
      .then(() => done())
      .catch(error => {
        // For some reason we need to wrap `emit` in a try-catch block
        // because it immediately throws the given error and the `done`
        // callback is never called as a result.
        try {
          this.emit('error', new gulpUtil.PluginError(pluginName, error, {
            showStack: !!options.debug
          }));
        } catch (e) {
          // ¯\_(シ)_/¯
        }
        done();
      });
  }

  return through.obj(onFile, onStreamEnd);
}
