/* eslint-disable @typescript-eslint/no-var-requires */
const { src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// @see https://gulpjs.com/docs/en/getting-started/working-with-files
exports.default = function () {
  return src('public/**/*.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('public/'));
};
