module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    var credentials = grunt.file.readJSON('credentials.private');

    grunt.initConfig({
        screeps: {
            experimental: {
                options: {
                    email: credentials.email,
                    password: credentials.password,
                    branch: 'experimental',
                    ptr: false
                },
                dist: {
                    src: ['js/*.js']
                }
            },
            live: {
                options: {
                    email: '0rigin.85@gmail.com',
                    password: 'SrjubfTy6Ymx2h8o',
                    branch: 'default',
                    ptr: false
                },
                dist: {
                    src: ['js/*.js']
                }
            }
        }
    });

    grunt.registerTask('default', ['screeps:experimental'])
};