/**
 * Gulp stylelint sourcemap.
 * @module gulp-stylelint/sourcemap
 */

import {findIndex, flatMap} from 'lodash';
import {SourceMapConsumer} from 'source-map';

/**
 * @param{Object} lintResult - Result of StyleLint.
 * @param{Function} originalPositionFor - A function to translate position
 * @return {Object} Same as lintResult structure.
 */
function _applySourcemap(lintResult, originalPositionFor) { // eslint-disable-line
  const results = flatMap(lintResult.results, result => {
    return result.warnings.map(warn => {
      const origPos = originalPositionFor(warn);
      return Object.assign({}, warn, origPos);
    }).reduce((sum, warn) => {
      const source = warn.source || result.source;
      delete warn.source;
      const idx = findIndex(sum, r => r.source === source);
      if (idx === -1) {
        const ret = Object.assign({}, result, {
          source,
          warnings: [warn]
        });
        sum.push(ret);
      } else {
        sum[idx].warnings.push(warn);
      }
      return sum;
    }, []);
  });

  return Object.assign({}, lintResult, {results});
}

/**
 * Applies sourcemap to lint result if exists.
 *
 * @param{Object} lintResult - Result of StyleLint.
 * @param{SourceMap} sourceMap - Raw source map object.
 * @return {Object} Same as lintResult structure.
 */
function applySourcemap(lintResult, sourceMap) {
  if (!sourceMap) {
    return lintResult;
  }
  const sourceMapConsumer = new SourceMapConsumer(sourceMap);
  const originalPositionFor = sourceMapConsumer.originalPositionFor.bind(sourceMapConsumer);
  return _applySourcemap(lintResult, originalPositionFor);
}

module.exports = {
  _applySourcemap,
  applySourcemap
};
