'use strict';
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  grunt.loadTasks('../../lib/task');
  var config = {
  	dest:'{{output}}'
  }
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),
    seabuild: {
    	options:{
			id: '{{id}}',
			uglify:{{uglify}}
		},
		main: {
			expand: true,
			cwd: "./",
			src: ["src/**/*.js", "index.js"],
			dest: config.dest
		}
    }
  });
  grunt.registerTask('default', ['seabuild']);
}
