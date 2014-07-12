var gulp = require('gulp'),
    g    = require('gulp-load-plugins')(),
    path = require('path'),
    fs   = require('fs');

var config = {
  src: {
    templates: './src/templates'
  },
  dist: './dist/',
  jsPath: './dist/scripts/',
  cssPath: './dist/styles/'
};

gulp.task('clean', function(){
  gulp.src(config.dist, {read: false})
    .pipe(g.clean());
});

gulp.task('copy', function(){
  gulp.src(['./lib/**'])
    .pipe(gulp.dest(config.dist));

  gulp.src(['./src/scripts/*.coffee'])
    .pipe(g.concat('app.js', {newLine: '\r\n'}))
    .pipe(g.coffee({bare: false}).on('error', g.util.log))
    .pipe(gulp.dest(config.jsPath));

  gulp.src(['./src/styles/*'])
    .pipe(gulp.dest(config.cssPath));
});

gulp.task('html', function(){
  return gulp.src('./src/index.html')
    .pipe(g.htmlReplace({
      js: addPrefix(getFileList(config.jsPath), './scripts/'),
      css: addPrefix(getFileList(config.cssPath), './styles/')
    }))
    .pipe(g.replace(/(\<script.*?type\s*=\s*"text\/template".*?id\s*=\s*"(.*)"\>).*?(\<\/script\>)/g, function(s, head, id, tail){
      var file = path.join(config.src.templates, id + '.html');
      if (fs.existsSync(file)){
        return head + "\r\n" + fs.readFileSync(file, {encoding: 'utf8'}) + "\r\n" + tail;
      } else {
        return '';
      }
    }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('watch', function(){
  gulp.watch('./src/**', ['copy','html'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

function getFileList(folder){
  return fs.readdirSync(folder);
};

function addPrefix(files, prefix){
  var ret = [];
  for (var i = 0, len = files.length; i < len; i++){
    ret[i] = prefix + files[i];
  }
  return ret;
};

gulp.task('default', ['copy', 'html']);
gulp.task('dev', ['default', 'watch']);
