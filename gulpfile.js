
var gulp       = require('gulp'),
    rename     = require('gulp-rename'),
    uglify     = require('gulp-uglify'),
    rollup     = require('gulp-rollup');

gulp.task('demo', function() {
    gulp.src(['./*.js', './frequentParam/*.js'])
        .pipe(rollup({
            "format": "iife",
            "plugins": [
                require("rollup-plugin-babel")({
                    "presets": [["es2015", { "modules": false }]],
                    "plugins": ["external-helpers"]
                })
            ],
            entry: './mario-es6.js'
        }))
        .pipe(uglify())
        .pipe(rename('mario-es6.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', function() {
    gulp.src(['./*.js', './frequentParam/*.js'])
        .pipe(rollup({
            "format": "iife",
            "plugins": [
                require("rollup-plugin-babel")({
                    "presets": [["es2015", { "modules": false }]],
                    "plugins": ["external-helpers"]
                })
            ],
            "moduleName": "Instrument",
            entry: './instrument-es6.js'
        }))
        /*.pipe(uglify())*/
        .pipe(rename('instrument-es6.min.js'))
        .pipe(gulp.dest('.'));
});

