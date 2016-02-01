var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');

var DIST = './dist',
    SRC = './src',
    TMP = './tmp',
    NAME = 'variable',
    DEPLOY = process.env.HOMEDRIVE + process.env.HOMEPATH + '/Documents/Qlik/Sense/Extensions/' + NAME;

gulp.task('requirejs', function (ready) {
    var requirejs = require('requirejs');
    var replace = require('gulp-replace');
    var DIRNAME = "extensions/" + NAME + "/";
    requirejs.optimize({
        baseUrl: SRC,
        paths: {
            "qlik": "empty:"
        },
        include: [NAME],
        exclude: ['qlik'],
        // optimize : 'uglify',
        findNestedDependencies: true,
        out: TMP + '/' + NAME + '.js'
    }, function () {
        gulp.src(TMP + '/' + NAME + '.js').
        pipe(replace('define("' + NAME + '",', 'define(')).
        pipe(replace('define("', 'define("'+DIRNAME)).
        pipe(gulp.dest(DIST));
        ready();
    }, function (error) {
        console.error('requirejs task failed', JSON.stringify(error));
        process.exit(1);
    });
});
gulp.task('qext', function () {
    return gulp.src(SRC + '/*.qext')
        .pipe(gulp.dest(DIST));
});

gulp.task('less', function () {
    var less = require('gulp-less');
    var LessPluginAutoPrefix = require('less-plugin-autoprefix');
    var autoprefix = new LessPluginAutoPrefix({
        browsers: ["last 2 versions"]
    });
    return gulp.src(SRC + '/**/*.less')
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(DIST));
});

gulp.task('css', function () {
    return gulp.src(SRC + '/**/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(DIST));
});


gulp.task('clean', function (ready) {
    var del = require('del');
    del.sync([DIST, TMP]);
    ready();
});

gulp.task('zip-build', ['qext', 'less', 'css', 'requirejs'], function () {
    var zip = require('gulp-zip');
    return gulp.src(DIST + '/**/*')
        .pipe(zip(NAME + '.zip'))
        .pipe(gulp.dest(DIST));
});

gulp.task('build', function () {
    return runSequence('clean',
        'zip-build'
    );
});

gulp.task('debug', ['less'], function () {
    return gulp.src([SRC + '/**/*.qext', SRC + '/**/*.js', DIST + '/**/*.css'])
        .pipe(gulp.dest(DEPLOY));

});

gulp.task('default', ['build']);
