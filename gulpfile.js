var gulp = require('gulp');
var del = require('del');
var replace = require('gulp-replace');
var zip = require('gulp-zip');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');
var requirejs = require('requirejs');

var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix = new LessPluginAutoPrefix({
    browsers: ["last 2 versions"]
});
var DIST = './dist',
    SRC = './src',
    TMP = './tmp',
    NAME = 'variable';

gulp.task('requirejs', function(ready) {
    requirejs.optimize({
        baseUrl: SRC,
        paths: {
            "qlik": "empty:"
        },
        include: [NAME],
        exclude: ['qlik'],
        // optimize : 'uglify',
        out: TMP+ '/'+NAME+'.js'
    }, function() {
        gulp.src(TMP+ '/'+NAME+'.js').
        pipe(replace('define("' + NAME + '",', 'define(')).
        pipe(gulp.dest(DIST));
        ready();
    }, function(error) {
        console.error('requirejs task failed', JSON.stringify(error));
        process.exit(1);
    });
});
gulp.task('qext', function() {
    return gulp.src(SRC + '/*.qext')
        .pipe(gulp.dest(DIST));
});

gulp.task('less', function() {
    return gulp.src( SRC + '/**/*.less')
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(DIST));
});

gulp.task('css', function() {
    return gulp.src(SRC + '/**/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(DIST));
});


gulp.task('clean', function(ready) {
    del.sync([DIST, TMP]);
    ready();
});

gulp.task('zip-build', function() {
    return gulp.src(DIST + '/**/*')
        .pipe(zip(NAME+'.zip'))
        .pipe(gulp.dest(DIST));
});

gulp.task('build', function() {
    runSequence('clean', ['qext', 'less', 'css', 'requirejs'],
        'zip-build'
    );
});

gulp.task('default', ['build']);
