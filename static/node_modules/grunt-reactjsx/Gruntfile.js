/*
 * grunt-reactjsx
 * https://github.com/steida/grunt-reactjsx
 *
 * Copyright (c) 2013 Daniel Steigerwald
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    reactjsx: {
      default_options: {
        files: [{
          expand: true,
          src: [
            // TIP: Use .rjsx for Sublime Text if you have .js files hidden.
            'test/fixtures/**/*.jsx'
          ],
          dest: 'tmp/',
          ext: '.js'
        }]
      }
    },

    nodeunit: {
      tests: ['test/*_test.js'],
    },

    release: {
      options: {}
    }

  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('test', ['jshint', 'clean', 'reactjsx', 'nodeunit']);
  grunt.registerTask('default', ['test']);

};