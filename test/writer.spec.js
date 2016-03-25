/* eslint-disable no-sync */

import test from 'tape';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import writer from '../src/writer';
import {stub} from 'sinon';

const tmpDir = path.resolve(__dirname, '../tmp');

test('writer should write to cwd if base dir is not specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = path.join(process.cwd(), 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt')
    .then(() => {
      t.true(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the current working directory'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .finally(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
    });
});

test('writer should write to a base folder if it is specified', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportDirPath = path.join(process.cwd(), 'foodir');
  const reportFilePath = path.join(reportDirPath, 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt', 'foodir')
    .then(() => {
      t.true(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the specified base folder'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .finally(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(reportDirPath);
    });
});

test('writer should strip chalk colors from formatted output', t => {
  stub(process, 'cwd').returns(tmpDir);
  const reportFilePath = path.join(process.cwd(), 'foo.txt');

  t.plan(1);

  writer(chalk.blue('footext'), 'foo.txt')
    .then(() => {
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'chalk colors have been stripped in report file'
      );
    })
    .catch(e => t.fail(`failed to create report file: ${e.message}`))
    .finally(() => {
      process.cwd.restore();
      fs.unlinkSync(reportFilePath);
    });
});
