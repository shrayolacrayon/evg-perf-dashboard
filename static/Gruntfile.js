module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        babel: {
          options: {
            sourceMap: true,
            plugins: ['transform-react-jsx'],
            presets: ['es2015', 'react']
          }
        },

        react: {
          dynamic_mappings: {
            files: [{
              expand: true,
              cwd: 'js/jsx',
              src: ['**/*.jsx'],
              dest: 'js',
              ext: '.js'
            }]
          }
        },

        watch: {
          css: {
            files: ['less/**'],
            tasks: ['css']
          },
          react: {
            files: ['js/jsx/**'],
            tasks: ['react']
          }
        },
        
        less: {
            main: {
                options: {
                    paths: ['less'],
                    sourceMap: true,
                    sourceMapFilename: 'dist/less.map',
                    sourceMapURL: '/dist/less.map',
                    sourceMapRootpath: '../../'
                },
                files: {
                    'static/dist/css/styles.css': 'less/main.less'
                }
            }
        },

        cssmin: {
            combine: {
                files: {
                    'static/dist/css/styles.min.css': 'dist/css/styles.css'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-react');

    grunt.registerTask('css', ['less', 'cssmin']);
    grunt.registerTask('default', ['css']);
};
