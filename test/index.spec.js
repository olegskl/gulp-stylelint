import path from 'path';
import gulp from 'gulp';
import test from 'tape';
import gulpStylelint from '../src/index';

/**
 * Creates a full path to the fixtures glob.
 * @param {String} glob - Src glob.
 * @return {String} Full path.
 */
function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

test('should not throw when no arguments are passed', t => {
  t.plan(1);
  t.doesNotThrow(gulpStylelint);
});

test('should emit an error on streamed file', t => {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'), {buffer: false})
    .pipe(gulpStylelint())
    .on('error', error => t.equal(
      error.message,
      'Streaming is not supported',
      'error has been emitted on streamed file'
    ));
});

test('should NOT emit an error when configuration is set', t => {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'))
    .pipe(gulpStylelint({config: {rules: []}}))
    .on('error', error => t.fail(`error ${error.code} has been emitted`))
    .on('finish', () => t.pass('no error emitted'));
});

test('should expose an object with stylelint formatter functions', t => {
  t.plan(2);
  t.equal(typeof gulpStylelint.formatters, 'object', 'formatters property is an object');
  const formatters = Object
    .keys(gulpStylelint.formatters)
    .map(fName => gulpStylelint.formatters[fName]);
  t.true(formatters.every(f => typeof f === 'function'), 'all formatters are functions');
});
