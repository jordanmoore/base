// Required components
var gulp = require('gulp'); // Core gulp file required to run... well all of this stuff
var gulpif = require('gulp-if'); // For making decisions based on file types
var plumber = require('gulp-plumber'); // For keeping watch tasks running when syntax errors occur
var uglify = require('gulp-uglify'); // For minifying JS files
var concat = require('gulp-concat'); // For pulling together multiple files
var sass = require('gulp-sass'); // For compiling Scss files
var sourcemaps = require('gulp-sourcemaps'); // For producing sourcemaps for Scss files for easy web inspection
var minifycss = require('gulp-minify-css'); // For minifying CSS files
var autoprefixer = require('gulp-autoprefixer'); // For writing cleaner CSS saving the need to write vendor prefixes
var notify = require('gulp-notify'); // For notifying your operating system after tasks have successfully run - like an 'everything is ok' alarm
var sprite = require('css-sprite').stream; // For generating CSS image sprites
var imagemin = require('gulp-imagemin'); // For image compression and optimisation
var livereload = require('gulp-livereload'); // For reloading changes live in the browser
var del = require('del'); // For cleaning up leftovers

// Running the default gulp command from the command line runs the following tasks with a dependency on the clean task running first
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'watch');
});

var paths = {
	images: 'images/',
	css: 'css/',
	js: 'js/'
}

// Generate sprites
gulp.task('sprites', function () {
  return gulp.src(paths.images + 'icons/*.png')
  	.pipe(plumber())
    .pipe(sprite({
      name: 'sprite',
      style: '_sprite.scss',
      retina: true,
      cssPath: '../images/icons',
      processor: 'scss'
    }))
    .pipe(gulpif('*.png', gulp.dest('dist/images/icons/'), gulp.dest(paths.css)))
});

// Optional generate base64 sprite for uber-optimisation
gulp.task('base64', function () {
  return gulp.src(paths.images + 'icons/*.png')
  	.pipe(plumber())
    .pipe(sprite({
      base64: true,
      style: '_base64.scss',
      processor: 'scss'
    }))
    .pipe(gulp.dest('src/css/'));
});

// Run concatenation and minification on JS files
gulp.task('scripts', function() {
	gulp.src(paths.js + '*.js')
  	.pipe(plumber())
	.pipe(concat('all.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'JavaScript compiled' }));
});

// Run concatenation, compile Sass, minifcation, sourcemaps and autoprefixes
gulp.task('styles', function () {
	gulp.src(paths.css + '*.scss')
  	.pipe(plumber())
	.pipe(sass({ style: 'expanded' }))
    .pipe(sourcemaps.init())
	.pipe(autoprefixer())
	.pipe(concat('all.min.css'))
	.pipe(minifycss())
	.pipe(gulp.dest('dist/css'))
    .pipe(notify({ message: 'CSS Compiled' }));
});

// Image optimisations
gulp.task('images', function() {
  return gulp.src([paths.images + '*.png', paths.images + '*.jpg'])
  	.pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images optimised' }));
});

// Cleanups
gulp.task('clean', function(cb) {
    del(['dist/css', 'dist/js', 'dist/images'], cb)
});

// Run gulp watch to auto reload with livereload browser plugin
gulp.task('watch', function() {
  gulp.watch(paths.css + '*.scss', ['styles']);
  gulp.watch(paths.js + '*.js', ['scripts']);
  gulp.watch(paths.images + '**/*', ['images']);
  gulp.watch('system/expressionengine/templates/default_site/**/*');
  livereload.listen();
  gulp.watch(['dist/**']).on('change', livereload.changed);
});