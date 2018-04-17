/* global require process Buffer */
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var dest = require('gulp-dest');
var pkg = require('./package.json');

var DIST = './dist',
	SRC = './src',
	TMP = './tmp',
	MAIN = pkg.main.substring(0, pkg.main.indexOf('.')),
	NAME = pkg.name,
	DEPLOY = process.env.HOMEDRIVE + process.env.HOMEPATH + '/Documents/Qlik/Sense/Extensions/' + NAME;

gulp.task('requirejs', ['less'], function (ready) {
	var requirejs = require('requirejs');
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
		pipe(replace('define("', 'define("' + DIRNAME)).
		pipe(replace('"./', '"' + DIRNAME)).
		pipe(gulp.dest(DIST));
		ready();
	}, function (error) {
		console.error('requirejs task failed', JSON.stringify(error));
		process.exit(1);
	});
});
gulp.task('qext', function () {
	var qext = {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		type: 'visualization',
		author: pkg.author
	};
	if (pkg.contributors) {
		qext.contributors = pkg.contributors;
	}
	var src = require('stream').Readable({
		objectMode: true
	})
	src._read = function () {
		this.push(new gutil.File({
			cwd: "",
			base: "",
			path: MAIN + '.qext',
			contents: new Buffer(JSON.stringify(qext, null, 4))
		}));
		this.push(null);
	}
	return src.pipe(gulp.dest(DIST));
});

gulp.task('less', function (ready) {
	var less = require('gulp-less');
	var LessPluginAutoPrefix = require('less-plugin-autoprefix');
	var autoprefix = new LessPluginAutoPrefix({
		browsers: ["last 2 versions"]
	});
	gulp.src(SRC + '/**/*.less')
		.pipe(less({
			plugins: [autoprefix]
		}))
		.pipe(cssnano())
		.pipe(replace('"','\''))
		.pipe(replace(/^/,
			'define([], function () {var style = document.createElement("style");style.innerHTML = "'))
		.pipe(replace(/$/, '";document.head.appendChild(style);});'))
		.pipe(dest('', {
			ext: '.js'
		}))
		.pipe(gulp.dest(SRC));
	ready();
});

gulp.task('clean', function (ready) {
	var del = require('del');
	del.sync([DIST, TMP]);
	ready();
});

gulp.task('zip-build', function () {
	var zip = require('gulp-zip');
	setTimeout(function () {
		gulp.src([DIST + '/**/*.qext', DIST + '/**/*.js'])
			.pipe(zip(NAME + '.zip'))
			.pipe(gulp.dest(DIST));
	}, 1000);
});

gulp.task('build', function () {
	return runSequence('clean', 'requirejs', 'qext',
		'zip-build'
	);
});

gulp.task('debug', ['less', 'qext'], function () {
	return gulp.src([DIST + '/**/*.qext', SRC + '/**/*.js'])
		.pipe(gulp.dest(DEPLOY));
});

gulp.task('deploy', ['less', 'qext', 'requirejs'], function () {
	return gulp.src([DIST + '/**/*.qext', DIST + '/**/*.js'])
		.pipe(gulp.dest(DEPLOY));
});

gulp.task('default', ['build']);
