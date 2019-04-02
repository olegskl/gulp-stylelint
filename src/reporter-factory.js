'use strict';

const fancyLog = require('fancy-log');
const {formatters} = require('stylelint');

const writer = require('./writer');

/**
 * Creates a reporter from the given config.
 * @param {Object} [config] - Reporter config.
 * @param {Object} [options] - Plugin options.
 * @return {Function} Reporter.
 */
module.exports = function reporterFactory(config = {}, options = {}) {

  /**
   * Formatter for stylelint results.
   *
   * User has a choice of passing a custom formatter function,
   * or a name of formatter bundled with stylelint by default.
   *
   * @type {Function}
   */
  const formatter = typeof config.formatter === 'string' ?
    formatters[config.formatter] :
    config.formatter;

  /**
   * Reporter.
   * @param {[Object]} results - Array of stylelint results.
   * @return {Promise} Resolved when writer and logger are done.
   */
  return function reporter(results) {

    /**
     * Async tasks performed by the reporter.
     * @type [Promise]
     */
    const asyncTasks = [];

    /**
     * Formatter output.
     * @type String
     */
    const formattedText = formatter(results);

    if (config.console && formattedText.trim()) {
      asyncTasks.push(
        fancyLog.info(`\n${formattedText}\n`)
      );
    }

    if (config.save) {
      asyncTasks.push(
        writer(formattedText, config.save, options.reportOutputDir)
      );
    }

    return Promise.all(asyncTasks);
  };
};
