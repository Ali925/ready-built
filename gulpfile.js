var gulp = require("gulp"),
    wiredep = require("wiredep").stream,
    useref = require("gulp-useref"),
    uglify = require("gulp-uglify"),
    clean = require("gulp-clean"),
    gulpif = require("gulp-if"),
    filter = require("gulp-filter"),
    size = require("gulp-size"),
    imagemin = require("gulp-imagemin"),
    concatCss = require("gulp-concat-css"),
    minifyCss = require("gulp-minify-css"),
    jade = require('gulp-jade'),
    prettify = require('gulp-prettify'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    reload = browserSync.reload;


gulp.task('jade', function() {
  gulp.src('app/templates/pages/*.jade')
    .pipe(jade())
    .on('error', log)
    .pipe(prettify({indent_size : 2}))
    .pipe(gulp.dest('app/'))
    .pipe(reload({stream: true}));
});

gulp.task('wiredep', function () {
  gulp.src('app/templates/common/*.jade')
    .pipe(wiredep({
    	ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/templates/common/'));
}); 

gulp.task('sass', function () {
    gulp.src('app/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/css'));
});

gulp.task('autoprefixer', ['sass'], function () {
    return gulp.src('app/css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('app/css/'));
});

gulp.task('server', ['jade', 'sass', 'wiredep', 'autoprefixer'], function() {
	browserSync({
   	  notify: false,
   	  port: 9000,
   	  server: {
    	baseDir: 'app'
      }
   });
});   

gulp.task('watch', function(){
	gulp.watch('app/templates/**/*.jade', ['jade']);
	gulp.watch('bower.json', ['wiredep']);
    gulp.watch([
        'app/css/*.css',
        'app/scss/*.scss',
        'app/js/*.js',
        'app/*.html']).on('change', reload);
});

gulp.task('clean', function(){
  return gulp.src('dist')
             .pipe(clean());
});

gulp.task('useref', function () {
    var assets = useref.assets();
 
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function(){
   gulp.src('app/fonts/*')
       .pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
       .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('images', function () {
    return gulp.src('app/img/**/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('extras', function(){
   return gulp.src([
         'app/*.*',
         '!app/*.html'  
   	    ]).pipe(gulp.dest('dist'));
});

gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function(){
   return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

gulp.task('build', ['clean'], function() {
   gulp.start('dist');
});

gulp.task('default', ['server', 'watch']);



var log = function (error) {
    console.log([
        '',
        '----------ERROR MESSAGE START----------',
        ('[' + error.name + ' in ' + error.plugin + ']'),
        error.message,
        '----------ERROR MESSAGE END----------',
        ''
    ].join('\n'));
    this.end();
};

