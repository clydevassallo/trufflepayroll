var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('run-command', function (cb) {
  exec('truffle compile --reset', function (err, stdout, stderr) {
    console.error(stderr);
    console.log(stdout);

    cb(err);
  });
})

gulp.task('watch', function() {
    gulp.watch('contracts/**/*.sol', ['run-command']);
});


gulp.task('default', function() {
  gulp.start('watch');
});