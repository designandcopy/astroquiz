/*====================================
=            Dependencies            =
====================================*/

var gulp = require('gulp');

var sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    changed = require('gulp-changed'),
    minifyHTML = require('gulp-htmlmin'),
    autoprefix = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    browsersync = require('browser-sync'),
    jshint = require('gulp-jshint'),
    autoprefixer = require('gulp-autoprefixer'),
		ignore = require('gulp-ignore'),
		gulpsync = require('gulp-sync')(gulp),
		del = require('del');


/*=======================================
=            Paths & Folders            =
=======================================*/

var paths = {

    styles: {
        src: './app/scss/**/*.scss',
        dest: './dist/css'
    },

    img: {
        src: './app/images/**/*.{png,jpg,jpeg,gif}',
        dest: './dist/images/'
    },

    js: {
        src: './app/js/**/*.js',
        dest: './dist/js/'
    },

    html: {
        src: './app/**/*.html',
        dest: './dist/'
    }

};


/*==================================
=            Gulp Tasks            =
==================================*/

// minify new or changed HTML pages
gulp.task('htmlpage', function() {
    gulp.src(paths.html.src)
        .pipe(changed(paths.html.dest))
        .pipe(minifyHTML({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(notify({ message: 'html complete' }));
});

gulp.task('images', function() {
    gulp.src(paths.img.src)
        .pipe(changed(paths.img.dest))
        .pipe(gulp.dest(paths.img.dest))
        .pipe(notify({ message: 'new images copied' }));
});

gulp.task('sass', function() {
    // globbing for sass source files
    gulp.src(paths.styles.src)
        .pipe(plumber())
        // compile to css
        .pipe(sass({ outputStyle: 'compressed' }).on('error', gutil.log))
        //.pipe(sourcemaps.init())
        // add sourcemaps
        .pipe(autoprefixer({ browsers: ['last 2 version'] }))
        //.pipe(sourcemaps.write())
        // write to css folder
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browsersync.stream())
        .pipe(notify({ message: 'sass compiled' }));
});

// JS hint task*
gulp.task('jshint', function() {
    gulp.src([paths.js.src, '!./app/js/handlebars*'])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
				.pipe(gulp.dest(paths.js.dest))
				.pipe(browsersync.reload({ stream: true, once: true }))
				.pipe(notify({ message: 'javascript linted' }));
});

// JS hint task*
gulp.task('js', function() {
    gulp.src(paths.js.src)
				.pipe(changed(paths.js.dest))
				.pipe(gulp.dest(paths.js.dest))
				.pipe(notify({ message: 'javascript copied' }));
});

gulp.task('clean', function () {
    del.sync('dist/**');
});

/*=====================================
=            Gulp Watchers            =
=====================================*/

// helper to make sure that html is fully built before reload
gulp.task('htmlpage-reload', ['htmlpage'], browsersync.reload);

gulp.task('watch', function() {
    // watch the source folders for changes and run the relevant tasks
    gulp.watch(paths.styles.src, ['sass']);
    gulp.watch(paths.html.src, ['htmlpage-reload']);
    gulp.watch(paths.img.src, ['images']);
		gulp.watch(paths.js.src, ['jshint']);
    // tell me that the watcher is running
    gutil.log('Watching source files for changes... Press ' + gutil.colors.cyan('CTRL + C') + ' to stop.');
});


/*===================================
=            BrowserSync            =
===================================*/

gulp.task('browser-sync', function() {
    browsersync.init({
        server: {
            baseDir: './dist'
        }
    });
});


/*=========================================
=            Default Gulp Task            =
=========================================*/
gulp.task('debug', ['htmlpage', 'images', 'sass', 'watch', 'jshint', 'js', 'browser-sync']);
gulp.task('default', gulpsync.sync(['clean', ['debug']]));
