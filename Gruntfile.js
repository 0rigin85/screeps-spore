module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-ts-clean');

    var credentials = grunt.file.readJSON('credentials.private');
    var src = ['js/*.js','js/**/*.js'];
    var devsrc = ['js/*.js*','js/**/*.js*'];

    grunt.initConfig({
        screeps: {
            experimental: {
                options: {
                    email: credentials.email,
                    password: credentials.password,
                    branch: 'experimental',
                    ptr: false
                },
                files: {
                    src: devsrc
                }
            },
            live: {
                options: {
                    email: credentials.email,
                    password: credentials.password,
                    branch: 'default',
                    ptr: false
                },
                files: {
                    src: src
                }
            }
        },
        ts_clean: {
            build: {
                options: {
                    // set to true to print files
                    verbose: false
                },
                src: ['./js/**/*'],
                dot: true
            }
        }
    });

    grunt.registerTask('default', ['screeps:experimental'])
    grunt.registerTask('live', ['ts_clean', 'screeps:live'])
};