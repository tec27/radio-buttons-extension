var gulp = require('gulp')
  , browserify = require('gulp-browserify')
  , concat = require('gulp-concat')

gulp.task('scripts', function() {
  gulp.src('index.js')
    .pipe(browserify())
    .pipe(concat('radio-buttons.js'))
    .pipe(gulp.dest('build/js'))
})

gulp.task('copy', function() {
  gulp.src('icons/**')
    .pipe(gulp.dest('build/icons'))

  gulp.src('css/**')
    .pipe(gulp.dest('build/css'))

  gulp.src('manifest.json')
    .pipe(gulp.dest('build/'))
})

gulp.task('default', function() {
  gulp.run('scripts', 'copy')

  gulp.watch('*.js', function(event) {
    gulp.run('scripts')
  })

  gulp.watch(['icons/**', 'css/**', 'manifest.json'], function(event) {
    gulp.run('copy')
  })
})
