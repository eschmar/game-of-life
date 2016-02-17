var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
 
gulp.task('default', function() {
    return gulp.src('./game-of-life.js')
        .pipe(uglify({
            mangle: true,
            compress: {
                unused: false
            }
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./'));
});