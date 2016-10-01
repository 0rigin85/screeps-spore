module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-ts-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-webpack');

    var credentials = grunt.file.readJSON('credentials.private');
    var src = ['dist/*.js','dist/**/*.js'];
    var devsrc = ['js/*.js*','js/**/*.js*'];

    grunt.initConfig(
        {
            webpack: {
                bundle: {
                    entry: ['./js/main.js'],
                    output: {
                        path: 'dist/',
                        filename: 'main.js',
                        libraryTarget: 'commonjs2'
                    }
                }
            },
            copy: {
                main: {
                    files: [
                        // includes files within path
                        {expand: true, flatten: true, src: ['js/main.js'], dest: './dist', filter: 'isFile'}
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
                    src: src
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
    grunt.registerTask('new', ['webpack:bundle', 'screeps:new']);
    //grunt.registerTask('live', ['ts_clean', 'screeps:live']);
    //grunt.registerTask('browserify', ['browserify:dist']);
};