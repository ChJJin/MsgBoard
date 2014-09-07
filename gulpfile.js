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

gulp.task('coffee', function(){
  gulp.src('./src/scripts/*.coffee')
    .pipe(g.concat('app.js', {newLine: '\r\n'}))
    .pipe(g.coffee({bare: false}).on('error', g.util.log))
    .pipe(gulp.dest('./src/scripts'));
});

gulp.task('copy', function(){
  gulp.src(['./src/lib/scripts/*.js', './src/scripts/*.js']) // make sure load lib scripts first
    .pipe(g.concat('all.js'))
    .pipe(g.uglify())
    .pipe(gulp.dest(config.jsPath));

  gulp.src(['./src/lib/styles/*.css', './src/styles/*.css']) // make sure load lib styles first
    .pipe(g.concat('all.css'))
    .pipe(gulp.dest(config.cssPath));
});

gulp.task('html:dev', function(){
  var jsFileList  = addPrefix(getFileList('./src/lib/scripts', '.js'), './lib/scripts/')
    .concat(addPrefix(getFileList('./src/scripts', '.js'), './scripts/'));
  var cssFileList = addPrefix(getFileList('./src/lib/styles', '.css'), './lib/styles/')
    .concat(addPrefix(getFileList('./src/styles', '.css'), './styles/'));

  gulp.src('./src/index.html')
    .pipe(g.htmlReplace({
      js: jsFileList,
      css: cssFileList
    }))
    .pipe(g.replace(/(\<script.*?type\s*=\s*"text\/template".*?id\s*=\s*"(.*)"\>).*?(\<\/script\>)/g, function(s, head, id, tail){
      var file = path.join(config.src.templates, id + '.html');
      if (fs.existsSync(file)){
        return head + "\r\n" + fs.readFileSync(file, {encoding: 'utf8'}) + "\r\n" + tail;
      } else {
        return '';
      }
    }))
    .pipe(g.rename('_index.html'))
    .pipe(gulp.dest('./src'));
});

gulp.task('html:pro', function(){
  return gulp.src('./src/index.html')
    .pipe(g.htmlReplace({
      js: addPrefix(getFileList(config.jsPath, '.js'), './scripts/'),
      css: addPrefix(getFileList(config.cssPath, '.css'), './styles/')
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

function getFileList(folder, extname){
  var ret = [];
  try {
    var fileList = fs.readdirSync(folder);
    for (var i = 0, len = fileList.length; i < len; i++){
      if (path.extname(fileList[i])==extname){
        ret.push(fileList[i]);
      }
    }
  } catch (e) {}
  return ret;
};

function addPrefix(files, prefix){
  var ret = [];
  for (var i = 0, len = files.length; i < len; i++){
    ret[i] = prefix + files[i];
  }
  return ret;
};

gulp.task('build:dev', ['coffee', 'html:dev']);
gulp.task('build:pro', ['coffee', 'copy', 'html:pro']);
gulp.task('default', ['build:dev', 'build:pro']);

// gulp.task('dev', ['default', 'watch']);
