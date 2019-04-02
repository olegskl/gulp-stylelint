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
export default async function applySourcemap(lintResult, sourceMap) {
  const sourceMapConsumer = await new SourceMapConsumer(sourceMap);

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

  // The consumer in versions ^0.7.0 of SourceMap need to be `destroy`ed after
  // usage, but the older don't, so we wrap it in a typeof for backwards compatibility:
  if (typeof sourceMapConsumer.destroy === 'function') {
    // Free this source map consumer's associated wasm data that is manually-managed:
    sourceMapConsumer.destroy();
  }

  return lintResult;
}
