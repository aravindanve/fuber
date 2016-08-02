module.exports = function(grunt) {

    // project configuration.

    var config = {
        pkg: grunt.file.readJSON('package.json'),
        less: {
            options: {
                compress: true
            },
            dev: {
                files: {
                    'public/css/styles.min.css': 'client/less/styles.less',
                }
            }
        },
        cssmin: {
            dev: {
                files: {}
            }
        },
        uglify: {
            dev: {
                options: {
                    mangle: true
                },
                files: {
                    'public/js/main.min.js': 'client/scripts/main.js'
                }
            }
        },
        watch: {
            scripts: {
                files: ['client/**/*.less', 'client/**/*.css', 'client/**/*.js'],
                tasks: ['default'],
                options: {
                    interrupt: true
                },
            },
        }
    }
    grunt.initConfig(config);

    // Load the plugin that provides the tasks
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // default tasks
    grunt.registerTask('default', ['newer:less', 'newer:cssmin', 'newer:uglify']);
    grunt.registerTask('compile', ['less', 'cssmin', 'uglify']);

};






