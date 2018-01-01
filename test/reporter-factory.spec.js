import test from 'tape';
import {stub} from 'sinon';
import fancyLog from 'fancy-log';
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
  const reporter = reporterFactory({formatter() {
    // empty formatter
  }});
  t.equal(
    typeof reporter({}).then,
    'function',
    'reporter is then-able'
  );
});

test('reporter should write to console if console param is true', t => {
  t.plan(1);
  stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: true
  });
  reporter({});
  t.true(
    fancyLog.info.calledWith('\nfoo\n'),
    'reporter has written padded formatter output to console'
  );
  fancyLog.info.restore();
});

test('reporter should NOT write to console if console param is false', t => {
  t.plan(1);
  stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; },
    console: false
  });
  reporter({});
  t.false(
    fancyLog.info.called,
    'reporter has NOT written anything to console'
  );
  fancyLog.info.restore();
});

test('reporter should NOT write to console if formatter returned only whitespace', t => {
  t.plan(1);
  stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return '  \n'; },
    console: true
  });
  reporter({});
  t.false(
    fancyLog.info.called,
    'reporter has NOT written anything to console'
  );
  fancyLog.info.restore();
});

test('reporter should NOT write to console by default', t => {
  t.plan(1);
  stub(fancyLog, 'info');
  const reporter = reporterFactory({
    formatter() { return 'foo'; }
  });
  reporter({});
  t.false(
    fancyLog.info.called,
    'reporter has NOT written anything to console'
  );
  fancyLog.info.restore();
});
