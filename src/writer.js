/**
 * Gulp stylelint writer.
 * @module gulp-stylelint/writer
 */

import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import stripAnsi from 'strip-ansi';
import {denodeify} from 'promise';

const mkdir = denodeify(mkdirp);
const writeFile = denodeify(fs.writeFile);

/**
 * Creates the output folder and writes formatted text to a file.
 * @param {String} text - Text to write (may be color-coded).
 * @param {String} dest - Destination path relative to destRoot.
 * @param {String} [destRoot] - Destination root folder, defaults to cwd.
 * @return {Promise} Resolved when folder is created and file is written.
 */
export default function writer(text, dest, destRoot = process.cwd()) {
  const fullpath = path.resolve(destRoot, dest);
  return mkdir(path.dirname(fullpath))
    .then(() => writeFile(fullpath, stripAnsi(text)));
}
