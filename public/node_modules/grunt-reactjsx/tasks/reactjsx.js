/*
 * grunt-reactjsx
 * https://github.com/steida/grunt-reactjsx
 *
 * Copyright (c) 2013 Daniel Steigerwald
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var transform = require('react-tools').transform;

  grunt.registerMultiTask('reactjsx', 'Compile Facebook React .jsx templates into .js', function() {
    this.files.forEach(function(f) {
      var src = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }
        return true;
      }).map(function(filepath) {
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(grunt.util.linefeed));

      try {
        src = transform(src);
      }
      catch(e) {
        grunt.log.error(e);
        grunt.fail.warn(f.src.join() + ' failed to compile.');
        return;
      }

      grunt.file.write(f.dest, src);
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};