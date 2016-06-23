var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var pkg = require('./package.json');

var DIST = './dist',
    SRC = './src',
    TMP = './tmp',
    MAIN = pkg.main.substring(0,pkg.main.indexOf('.')), 
    NAME = pkg.name,
    DEPLOY = process.env.HOMEDRIVE + process.env.HOMEPATH + '/Documents/Qlik/Sense/Extensions/' + NAME;

gulp.task('requirejs', function (ready) {
    var requirejs = require('requirejs');
    var replace = require('gulp-replace');
    var DIRNAME = "extensions/" + MAIN + "/";
    requirejs.optimize({
        baseUrl: SRC,
        paths: {
            "qlik": "empty:"
        },
        include: [MAIN],
        exclude: ['qlik'],
        // optimize : 'uglify',
        findNestedDependencies: true,
        out: TMP + '/' + MAIN + '.js'
    }, function () {
        gulp.src(TMP + '/' + MAIN + '.js').
        pipe(replace('define("' + MAIN + '",', 'define(')).
        pipe(replace('define("', 'define("'+DIRNAME)).
        pipe(gulp.dest(DIST));
        ready();
    }, function (error) {
        console.error('requirejs task failed', JSON.stringify(error));
        process.exit(1);
    });
});
gulp.task('qext', function () {
    var qext = {
        name:pkg.name, 
        description: pkg.description,
        version: pkg.version, 
        type: 'visualization',
        author: pkg.author,
    };
    var src = require('stream').Readable({ objectMode: true })
    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: MAIN+'.qext', 
                                  contents: new Buffer(JSON.stringify(qext,null,4)) }));
        this.push(null);
    }
    return src.pipe(gulp.dest(DIST));
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

gulp.task('debug', ['less','qext'], function () {
    return gulp.src([DIST + '/**/*.qext', SRC + '/**/*.js', DIST + '/**/*.css'])
        .pipe(gulp.dest(DEPLOY));

});

gulp.task('deploy', ['less','qext','css', 'requirejs'], function () {
    return gulp.src([DIST + '/**/*.qext', DIST + '/**/*.js', DIST + '/**/*.css'])
        .pipe(gulp.dest(DEPLOY));
});

gulp.task('default', ['build']);
