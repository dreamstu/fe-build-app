'use strict';
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  grunt.loadTasks('../../lib/task');
  var config = {
  	dest:'C://Users/Administrator/Desktop/dist'
  }
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),
    seabuild: {
    	options:{
  			id: 'modules',
        uglify:true,
        mislead:true
  		},
  		main: {
  			expand: true,
  			cwd: "./",
  			src: ["src/**/*.js", "index.js", "src/**/*.tpl"],
  			dest: config.dest
  		}
    }
  });
  grunt.registerTask('default', ['seabuild']);
}
