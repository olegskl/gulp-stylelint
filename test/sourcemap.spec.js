import path from 'path';
import gulp from 'gulp';
import test from 'tape';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpCleanCss from 'gulp-clean-css';
import gulpRename from 'gulp-rename';
import gulpConcat from 'gulp-concat';
import gulpStylelint from '../src/index';

/**
 * Creates a full path to the fixtures glob.
 * @param {String} glob - Src glob.
 * @return {String} Full path.
 */
function fixtures(glob) {
  return path.join(__dirname, 'fixtures', glob);
}

test('should emit no errors when stylelint rules are satisfied', t => {
  t.plan(1);
  gulp
    .src(fixtures('original-*.css'))
    .pipe(gulpSourcemaps.init())
    .pipe(gulpStylelint({
      config: {rules: {}}
    })
    .on('finish', () => t.pass('no error emitted')));
});

test('should apply sourcemaps correctly', t => {
  t.plan(6);
  gulp
    .src(fixtures('original-*.css'))
    .pipe(gulpSourcemaps.init())
    .pipe(gulpCleanCss())
    .pipe(gulpConcat('concatenated.css'))
    .pipe(gulpRename({prefix: 'renamed-'}))
    .pipe(gulpStylelint({
      config: {rules: {
        'declaration-no-important': true
      }},
      reporters: [{
        formatter(lintResult) {
          t.deepEqual(
            lintResult.map(r => r.source),
            ['original-a.css', 'original-b.css'],
            'there are two files'
          );
          t.equal(
            lintResult[0].warnings[0].line,
            2,
            'original-a.css has an error on line 2'
          );
          t.equal(
            lintResult[0].warnings[0].column,
            9,
            'original-a.css has an error on column 9'
          );
          t.equal(
            lintResult[1].warnings[0].line,
            2,
            'original-b.css has an error on line 2'
          );
          t.equal(
            lintResult[1].warnings[0].column,
            9,
            'original-b.css has an error on column 9'
          );
        }
      }]
    }))
    .on('error', error => t.pass(`error ${error.code} has been emitted correctly`));
});
