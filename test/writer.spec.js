/* eslint-disable no-sync */

import test from 'tape';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import writer from '../src/writer';

test('writer should write to cwd if base dir is not specified', t => {
  const cwd = process.cwd();
  const reportDirPath = path.join(cwd);
  const reportFilePath = path.join(reportDirPath, 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt')
    .then(() => {
      t.ok(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the current working directory'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
      fs.unlinkSync(reportFilePath);
    })
    .catch(e => {
      t.fail(`failed to create report file: ${e.message}`);
      fs.unlinkSync(reportFilePath);
    });
});

test('writer should write to a base folder if it is specified', t => {
  const cwd = process.cwd();
  const reportDirPath = path.join(cwd, 'foodir');
  const reportFilePath = path.join(reportDirPath, 'foo.txt');

  t.plan(2);

  writer('footext', 'foo.txt', 'foodir')
    .then(() => {
      t.ok(
        fs.statSync(reportFilePath).isFile(),
        'report file has been created in the specified base folder'
      );
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'report file has correct contents'
      );
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(reportDirPath);
    })
    .catch(e => {
      t.fail(`failed to create report file: ${e.message}`);
      fs.unlinkSync(reportFilePath);
      fs.rmdirSync(reportDirPath);
    });
});

test('writer should strip chalk colors from formatted output', t => {
  const cwd = process.cwd();
  const reportDirPath = path.join(cwd);
  const reportFilePath = path.join(reportDirPath, 'foo.txt');

  t.plan(1);

  writer(chalk.blue('footext'), 'foo.txt')
    .then(() => {
      t.equal(
        fs.readFileSync(reportFilePath, 'utf8'),
        'footext',
        'chalk colors have been stripped in report file'
      );
      fs.unlinkSync(reportFilePath);
    })
    .catch(e => {
      t.fail(`failed to create report file: ${e.message}`);
      fs.unlinkSync(reportFilePath);
    });
});
