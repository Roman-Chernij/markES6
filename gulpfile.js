    const gulp            = require('gulp'),
          sass            = require('gulp-sass'),
          browserSync     = require('browser-sync'),
          concat          = require('gulp-concat'),
          uglify          = require('gulp-uglifyjs'),
          rename          = require('gulp-rename'),
          autoprefixer    = require('gulp-autoprefixer'),
          del             = require('del'),
          imagemin        = require('gulp-imagemin'),
          pngquant        = require('imagemin-pngquant'),
          cache           = require('gulp-cache'),
          autopolyfiller  = require('gulp-autopolyfiller'),
          merge           = require('event-stream').merge,
          order           = require("gulp-order"),
          babel           = require('gulp-babel'),
          csso            = require('gulp-csso'),
          sourcemaps      = require('gulp-sourcemaps'),
          plumber         = require('gulp-plumber'),
          inject          = require('gulp-inject'),
          browserify      = require('browserify'),
          source          = require('vinyl-source-stream'),
          notifier        = require("node-notifier"),
          gutil           = require('gulp-util'),
          babelify        = require('babelify');


    const PATHS = {
        src: 'src',
        dist: 'dist',
        images: 'Images',
        scss: 'scss',
        fonts: 'fonts',
        js: 'js',
        css: 'css'

    };

    //CSS files
gulp.task('sass:inject', () => {

    let url =  {
            basis: `./${PATHS.src}/${PATHS.scss}/basis/index.scss`,
            layout: `./${PATHS.src}/${PATHS.scss}/layout/*.scss`,
            modules: `./${PATHS.src}/${PATHS.scss}/modules/*.scss`,
            state: `./${PATHS.src}/${PATHS.scss}/state/*.scss`,
            theme: `./${PATHS.src}/${PATHS.scss}/theme/*.scss`,
            style: `./${PATHS.src}/${PATHS.scss}/style.scss`
        },
    target = gulp.src(url.style),
    sources = gulp.src([
        url.basis,
        url.layout,
        url.modules,
        url.state,
        url.theme
    ], {
      read: false
    });

    return target
      .pipe(inject(sources, {
        relative: true
      }))
      .pipe(gulp.dest(`./${PATHS.src}/${PATHS.scss}`))
  });

gulp.task('sass', ['sass:inject'],  () => {
     gulp.src([
        `./${PATHS.src}/${PATHS.scss}/libs.scss`,
        `./${PATHS.src}/${PATHS.scss}/style.scss`
    ])
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer([
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 8',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6'
    ]))
    .pipe(concat('style.css'))
    .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`./${PATHS.dist}/${PATHS.css}`))
    .pipe(browserSync.reload({stream: true}))
});


    gulp.task('js', function () {
        browserify({entries: `./${PATHS.src}/${PATHS.js}/App.js`, debug: true})
            .transform('babelify', {presets: ['es2015']})
            .bundle().on('error', function (err) {
            showError.apply(this, ['JS error', err])
        })
            .pipe(source('app.js'))

            // .pipe(uglify())
            // .pipe(browserSync.reload({stream: true}))
            .pipe(gulp.dest(`./${PATHS.src}/${PATHS.dist}`));
    });



gulp.task('scripts',['js'],  function () {
    gulp.src([
        `./${PATHS.src}/${PATHS.dist}/app.js`
    ])
    .pipe(autopolyfiller('polyfills.js', {
        browsers: [
                 'Android 2.3',
                 'Android 4',
                 'Chrome 20',
                 'Firefox 24',
                 'ie 8',
                 'ie 9',
                 'iOS 6',
                 'Opera 12',
                 'Safari 6']
    }))

  //  let libs = gulp.src([
  //   "app/libs/*.js"
  // ])
  // .pipe(concat('libs.js'));
  //
  // return merge(polyfills, all, libs)
  //   .pipe(order([
  //       'polyfills.js',
  //       'libs.js',
  //       'all.js'
  //   ]))

    // .pipe(concat('build.min.js'))
        .pipe(rename({
            basename: "script",
            suffix: '.min'
        }))
    .pipe(uglify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(`./${PATHS.dist}/${PATHS.js}`))

    .pipe(browserSync.reload({stream: true}))
});


gulp.task('browserSync', () => {
    browserSync({
        server:{
            baseDir: PATHS.dist
    },
    notify: false
    });
});

gulp.task('img', () => {
        return gulp.src(`./${PATHS.src}/${PATHS.images}/**/*`)
            .pipe(cache(imagemin({
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })))
            .pipe(gulp.dest(`./${PATHS.dist}/${PATHS.images}`));
    });

gulp.task('clear', function () {
    return cache.clearAll();
});

gulp.task('clean', function () {
    return del.sync('app/dist');
});


gulp.task('html', () => {
  return gulp.src(`./${PATHS.src}/*.html`)
  .pipe(gulp.dest(`./${PATHS.dist}`))
  .pipe(browserSync.reload({stream: true}))
})

gulp.task('watch', ['browserSync', 'sass', 'scripts', 'html'], () => {
    gulp.watch(`./${PATHS.src}/${PATHS.scss}/**/*.+(scss|sass)` , ['sass']);
    gulp.watch(`./${PATHS.src}/*.html`, ['html']);
    gulp.watch(`./${PATHS.src}/${PATHS.js}/**/*.js`, ['scripts']);
    gulp.watch(`./${PATHS.src}/${PATHS.images}/**/*`, ['img']);
});




    /**
     * Show error in console
     * @param  {String} preffix Title of the error
     * @param  {String} err     Error message
     */
    function showError(preffix, err) {
        gutil.log(gutil.colors.white.bgGreen(' ' + preffix + ' '), gutil.colors.white.bgRed(' ' + err.message + ' '));
        notifier.notify({title:preffix, message: err.message });
        this.emit("end");
    }

gulp.task('default', ['watch']);
