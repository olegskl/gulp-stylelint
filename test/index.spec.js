/* global __dirname */

import path from 'path';
import gulp from 'gulp';
import test from 'tape';

import gulpStylelint from '../src';

/**
 * Creates a full path to the fixtures glob.
 * @param  {String} glob Src glob.
 * @return {String}      Full path.
 */
function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

test('should not throw when no arguments are passed', function (t) {
  t.plan(1);
  t.doesNotThrow(gulpStylelint);
});

test('should not throw when piped without args through gulp', function (t) {
  t.plan(1);
  t.doesNotThrow(function () {
    gulp
      .src(fixtures('basic.css'))
      .pipe(gulpStylelint());
  });
});

test('should emit an error on streamed file', function (t) {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'), {buffer: false})
    .pipe(gulpStylelint())
    .on('error', err => t.equal(err.message, 'Streaming not supported'));
});

test('should emit an error when there is no configuration', function (t) {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'))
    .pipe(gulpStylelint())
    .on('error', error => t.equal(error.code, 78));
});

test('should NOT emit an error when configuration is set', function (t) {
  t.plan(1);
  gulp
    .src(fixtures('basic.css'))
    .pipe(gulpStylelint({stylelint: {rules: []}}))
    .on('error', error => t.fail(`error ${error.code} has been emitted`))
    .on('finish', () => t.pass('no error emitted'));
});
