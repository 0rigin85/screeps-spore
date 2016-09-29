module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-ts-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');

    var credentials = grunt.file.readJSON('credentials.private');
    var src = ['js/*.js','js/**/*.js'];
    var devsrc = ['js/*.js*','js/**/*.js*'];

    grunt.initConfig(
        {
            browserify: {
                dist: {
                    src: ['js/*.js'],
                    dest: 'dist/main.js'
                }
            },
            copy: {
                main: {
                    files: [
                        // includes files within path
                        {expand: true, flatten: true, src: ['node_modules/typescript-collections/dist/lib/*.js'], dest: './js', filter: 'isFile'}
                    ]
                }
            },
            screeps: {
            new: {
                options: {
                    email: credentials.email,
                    password: credentials.password,
                    branch: 'new',
                    ptr: false
                },
                files: {
                    src: devsrc
                }
            },
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

    //grunt.registerTask('default', ['screeps:experimental']);
    grunt.registerTask('new', ['screeps:new']);
    //grunt.registerTask('live', ['ts_clean', 'screeps:live']);
    //grunt.registerTask('browserify', ['browserify:dist']);
};