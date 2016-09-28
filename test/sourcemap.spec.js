import test from 'tape';
import {applySourcemap, _applySourcemap} from '../src/sourcemap';

test('when sourcemap is undefined, should return same Object', t => {
  t.plan(1);
  const result = {
    results: [{
      source: "path/to/fake/source",
      warnings: []
    }]
  };

  const applied = applySourcemap(result, undefined);
  t.equal(result, applied, 'return same object')
});

test('should return applied lint result', t => {
  t.plan(1);
  const result = {
    results: [{
      source: "path/to/fake/source",
      warnings: [
        {line: 1, column: 1, text: 'foo'},
        {line: 2, column: 2, text: 'foo'},
        {line: 1, column: 3, text: 'foo'},
        {line: 3, column: 2, text: 'foo'},
      ]
    }]
  };

  const originalPositionFor = pos => {
    if (pos.line === 1) {
      return {
        source: 'path/to/real/source',
        line: 2,
        column: 3
      }
    } else {
      return {
        source: 'path/to/real/source2',
        line: 20,
        column: 30
      }
    }
  };

  const applied = _applySourcemap(result, originalPositionFor);
  t.deepEqual(applied, {
    results: [{
      source: 'path/to/real/source',
      warnings: [
        {line: 2, column: 3, text: 'foo'},
        {line: 2, column: 3, text: 'foo'},
      ]
    }, {
      source: 'path/to/real/source2',
      warnings: [
        {line: 20, column: 30, text: 'foo'},
        {line: 20, column: 30, text: 'foo'},
      ]

    }]
  }, 'line, col, source is replaced')
});
