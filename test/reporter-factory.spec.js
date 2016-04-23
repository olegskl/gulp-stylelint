import test from 'tape';
import {stub} from 'sinon';
import gulpUtil from 'gulp-util';
import reporterFactory from '../src/reporter-factory';

test('reporter factory should return a function', t => {
  t.plan(1);
  t.equal(
    typeof reporterFactory(),
    'function',
    'reporter factory has returned a function'
  );
});

test('reporter should return a promise', t => {
  t.plan(1);
  const reporter = reporterFactory({formatter() {}});
  t.equal(
    typeof reporter({}).then,
    'function',
    'reporter is then-able'
  );
});

test('reporter should write to console if console param is true', t => {
  t.plan(1);
  stub(gulpUtil, 'log');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: true
  });
  reporter({});
  t.true(
    gulpUtil.log.calledWith('\nfoo\n'),
    'reporter has written padded formatter output to console'
  );
  gulpUtil.log.restore();
});

test('reporter should NOT write to console if console param is false', t => {
  t.plan(1);
  stub(gulpUtil, 'log');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: false
  });
  reporter({});
  t.false(
    gulpUtil.log.called,
    'reporter has NOT written anything to console'
  );
  gulpUtil.log.restore();
});

test('reporter should NOT write to console if formatter returned only whitespace', t => {
  t.plan(1);
  stub(gulpUtil, 'log');
  const reporter = reporterFactory({
    formatter() { return '  \n'; },
    console: true
  });
  reporter({});
  t.false(
    gulpUtil.log.called,
    'reporter has NOT written anything to console'
  );
  gulpUtil.log.restore();
});

test('reporter should NOT write to console by default', t => {
  t.plan(1);
  stub(gulpUtil, 'log');
  const reporter = reporterFactory({
    formatter() { return 'foo'; }
  });
  reporter({});
  t.false(
    gulpUtil.log.called,
    'reporter has NOT written anything to console'
  );
  gulpUtil.log.restore();
});
