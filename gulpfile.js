/* eslint-env commonjs, node */
/* eslint-disable no-console */

'use strict';

var gulp        = require('gulp'),
    $$          = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    pipe        = require('multipipe'),
    version     = require('./package.json').version;

var name        = 'datasaur-sorter',
    srcDir      = './',
    buildDir    = './build/';

//  //  //  //  //  //  //  //  //  //  //  //

gulp.task('lint', lint);
gulp.task('saurify', saurify);

gulp.task('default', function(callback) {
    clearBashScreen();
    runSequence(
        'lint',
        'saurify',
        callback
    );
});

//  //  //  //  //  //  //  //  //  //  //  //

function clearBashScreen() {
    var ESC = '\x1B';
    console.log(ESC + 'c'); // (VT-100 escape sequence)
}

function lint() {
    return gulp.src(srcDir + 'index.js')
        .pipe($$.excludeGitignore())
        .pipe($$.eslint())
        .pipe($$.eslint.format())
        .pipe($$.eslint.failAfterError());
}

function saurify() {
    return gulp.src(srcDir + 'index.js')
        .pipe($$.replace( // ...starting immediately following 'use strict' and...
            /var\s+(\w+)\s*=\s*.*datasaur-(\w+).*;/,
            '(function() {\n\nvar $1 = window.datasaur.$2;'
        ))
        .pipe($$.replace( // ...ending after modules.exports.
            /\w+\.exports(\s*=\s*)(\w+);/,
            'window.' + name.replace('-', '.') + '$1$2;\n\n})();'
        ))
        .pipe(
            $$.mirror(
                pipe(
                    $$.mirror(
                        pipe($$.rename(version + '/' + name + '.js')),
                        pipe($$.rename('edge/' + name + '.js'))
                    )
                ),
                pipe(
                    $$.uglify().on('error', $$.util.log),
                    $$.mirror(
                        pipe($$.rename(version + '/' + name + '.min.js')),
                        pipe($$.rename('edge/' + name + '.min.js'))
                    )
                )
            )
        )
        .pipe(gulp.dest(buildDir));
}


