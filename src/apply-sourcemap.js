/**
 * Gulp stylelint sourcemap.
 * @module gulp-stylelint/apply-sourcemap
 */

import {SourceMapConsumer} from 'source-map';

/**
 * Applies a sourcemap to Stylelint result.
 *
 * @param {Object} lintResult - Result of StyleLint.
 * @param {Object} sourceMap - Sourcemap object.
 * @return {Object} Rewritten Stylelint result.
 */
export default function applySourcemap(lintResult, sourceMap) {
  const sourceMapConsumer = new SourceMapConsumer(sourceMap);

  lintResult.results = lintResult.results.reduce((memo, result) => {
    if (result.warnings.length) {
      result.warnings.forEach(warning => {
        const origPos = sourceMapConsumer.originalPositionFor(warning);
        warning.line = origPos.line;
        warning.column = origPos.column;
        const sameSourceResultIndex = memo.findIndex(r => r.source === origPos.source);
        if (sameSourceResultIndex === -1) {
          memo.push(Object.assign({}, result, {
            source: origPos.source,
            warnings: [warning]
          }));
        } else {
          memo[sameSourceResultIndex].warnings.push(warning);
        }
      });
    } else {
      memo.push(result);
    }
    return memo;
  }, []);

  return lintResult;
}
