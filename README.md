# gulp-stylelint

[![NPM version](http://img.shields.io/npm/v/gulp-stylelint.svg)](https://www.npmjs.org/package/gulp-stylelint)
[![Build Status](https://travis-ci.org/olegskl/gulp-stylelint.svg?branch=master)](https://travis-ci.org/olegskl/gulp-stylelint)
[![Code Climate](https://codeclimate.com/github/olegskl/gulp-stylelint/badges/gpa.svg)](https://codeclimate.com/github/olegskl/gulp-stylelint)
[![Join the chat at https://gitter.im/olegskl/gulp-stylelint](https://badges.gitter.im/olegskl/gulp-stylelint.svg)](https://gitter.im/olegskl/gulp-stylelint?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A [Gulp](http://gulpjs.com/) plugin that runs [stylelint](https://github.com/stylelint/stylelint) results through a list of provided reporters.

## Installation

```bash
npm install gulp-stylelint --save-dev
```

## Quick start

With gulp-stylelint, it's easy to generate CSS lint reports based on [stylelint](https://github.com/stylelint/stylelint) results.

If you already have a .stylelintrc file in your project directory:

```js
import gulp from 'gulp';
import gulpStylelint from 'gulp-stylelint';
import consoleReporter from 'gulp-stylelint-console-reporter';

gulp.task('lint-css', function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      reporters: [
        consoleReporter()
      ]
    }));
});
```

Note that if you're using ES5, you will have to access the library via the `default` property due to [the way exports are handled in Babel 6](https://phabricator.babeljs.io/T2212):

```js
var gulpStylelint = require('gulp-stylelint').default;
```

## Reporters

Here's the list of currently available reporters:

 - [gulp-stylelint-console-reporter](https://github.com/olegskl/gulp-stylelint-console-reporter)
 - [gulp-stylelint-checkstyle-reporter](https://github.com/olegskl/gulp-stylelint-checkstyle-reporter)
 - [gulp-stylelint-fail-reporter](https://github.com/olegskl/gulp-stylelint-fail-reporter)

## Options

Below is an example with all available options provided:

```js
import gulp from 'gulp';
import gulpStylelint from 'gulp-stylelint';
import consoleReporter from 'gulp-stylelint-console-reporter';

gulp.task('lint-css', function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      stylelint: {
        extends: 'stylelint-config-suitcss'
      },
      reporters: [
        consoleReporter()
      ],
      debug: true
    }));
});
```

#### `stylelint` [Object]

See [stylelint configuration](https://github.com/stylelint/stylelint/blob/master/docs/user-guide/configuration.md) options. When omitted, the configuration is taken from the .stylelintrc file.

#### `reporters` [Array<Function>] default: `[]`

List of reporters. The order of execution is sequential.

#### `debug` [Boolean] default: `false`

When set to `true`, the error handler will print stack trace of errors.

## Writing reporters

A gulp-stylelint reporter is an asynchronous function that takes the stylelint results array and outputs a report of some kind (logs to console, writes to a file, ...). The resolved result is not used.

Below is an example of a reporter that logs the number processed files after a preconfigured delay.

```js
//
// gulp-stylelint-custom-reporter.js
// --------------------

export default function customReporterInit(options = {}) {

  return function customReporter(results) {
    return new Promise(resolve => {
      setTimeout(function () {
        console.log(`${results.length} files have been processed`);
        resolve();
      }, options.delay);
    })
  };

}

//
// css-lint-task.js
// --------------------

import gulp from 'gulp';
import gulpStylelint from 'gulp-stylelint';
import customReporter from './gulp-stylelint-custom-reporter';

gulp.task('lint-css', function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      reporters: [
        customReporter({delay: 1337})
      ]
    }));
});
```

## License

**gulp-stylelint** is Copyright (c) 2016 [Oleg Sklyanchuk](http://olegskl.com) and licensed under the MIT license. See the included LICENSE file for more details.
