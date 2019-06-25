const path = require('path');

module.exports = function(grunt) {
  require('time-grunt')(grunt);

  var config = grunt.file.readJSON('screeps.grunt');

  // parameters
  var privateDirectory = grunt.option('privateDirectory') || config.privateDirectory;
  var branch = grunt.option('branch') || config.branch;
  var email = grunt.option('email') || config.email;
  var password = grunt.option('password') || config.password;
  var ptr = grunt.option('ptr') ? true : config.ptr;

  // variables
  const sourcePath = path.join(__dirname, './src');
  const outPath = path.join(__dirname, './dist');

  grunt.loadNpmTasks('grunt-screeps');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-file-append');

  grunt.loadNpmTasks('grunt-ts-clean');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-rsync');

  var currentdate = new Date();

  // Output the current date and branch.
  grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
  grunt.log.writeln('Branch: ' + branch);

  grunt.initConfig({
    // Upload code to Screeps servers
    screeps: {
      distToPublic: {
        options: {
          email: email,
          password: password,
          branch: branch,
          ptr: ptr
        },
        files: {
          src: ['dist/*.js']
        }
      },
      jsToPublic: {
        options: {
          email: email,
          password: password,
          branch: branch + '-dbg',
          ptr: ptr
        },
        files: {
          src: ['js/*.js']
        }
      },
      distToPrivate: {
        options: {
          server: {
            host: 'your.server.hostname.or.ip',
            port: 21025,
            http: true
          },
          email: 'YOUR_EMAIL',
          password: 'YOUR_PASSWORD',
          branch: branch,
          ptr: false
        },
        files: {
          src: ['dist/*.js']
        }
      },
      jsToPrivate: {
        options: {
          server: {
            host: 'your.server.hostname.or.ip',
            port: 21025,
            http: true
          },
          email: 'YOUR_EMAIL',
          password: 'YOUR_PASSWORD',
          branch: branch + '-dbg',
          ptr: false
        },
        files: {
          src: ['dist/*.js']
        }
      }
    },
    // Copy files to the folder the client uses to sink to the private server.
    // Use rsync so the client only uploads the changed files.
    rsync: {
      options: {
        args: ['--verbose', '--checksum'],
        exclude: ['.git*'],
        recursive: true
      },
      distToPrivate: {
        options: {
          src: 'dist/',
          dest: privateDirectory + branch + '/'
        }
      },
      jsToPrivate: {
        options: {
          src: './js/',
          dest: privateDirectory + branch + '-dbg/'
        }
      }
    },
    // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
    copy: {
      // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
      screeps: {
        expand: true,
        cwd: 'bin/',
        src: '**',
        dest: 'js/',
        filter: 'isFile',
        rename: function(dest, src) {
          // Change the path name utilize underscores for folders
          return dest + src.replace(/\//g, '_');
        },
        options: {
          process: function(content, srcpath) {
            return content.replace(/require\("..\//g, 'require("./').replace(/(?<![\.\/\n\s\*<>])\//g, '_');
          }
        }
      },
      distToPrivate: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: '**',
            dest: privateDirectory + branch + '/',
            filter: 'isFile'
          }
        ]
      },
      jsToPrivate: {
        files: [
          {
            expand: true,
            cwd: 'js/',
            src: '**',
            dest: privateDirectory + branch + '/',
            filter: 'isFile'
          }
        ]
      }
    },
    // Add version variable using current timestamp.
    file_append: {
      versioning: {
        files: [
          {
            append: 'exports.SCRIPT_VERSION = ' + currentdate.getTime() + ';\n',
            input: 'bin/version.js'
          }
        ]
      }
    },
    ts: {
      default: {
        // specifying tsconfig as a boolean will use the 'tsconfig.json' in same folder as Gruntfile.js
        tsconfig: true
      }
    },
    ts_clean: {
      build: {
        options: {
          // set to true to print files
          verbose: false
        },
        src: ['./bin/**/*'],
        dot: true
      }
    },
    webpack: {
      bundle: {
        mode: 'production',
        entry: ['./js/main.js'],
        output: {
          path: outPath,
          filename: 'main.js',
          libraryTarget: 'commonjs2'
        }
      },
      ts: {
        entry: './src/main.ts',
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              exclude: /node_modules/,
              options: {
                compilerOptions: {
                  module: 'commonjs',
                  target: 'es6',
                  sourceMap: true,
                  removeComments: false,
                  noImplicitAny: false,
                  outDir: './bin',
                  rootDir: './src',
                  experimentalDecorators: true,
                  moduleResolution: 'node'
                }
              }
            }
          ]
        },
        devtool: 'inline-source-map',
        resolve: {
          extensions: ['.tsx', '.ts', '.js']
        },
        output: {
          filename: 'main.js',
          path: path.resolve(__dirname, 'dist')
        }
      }
    },
    // Remove all files from the dist folder.
    clean: {
      dist: ['dist'],
      js: ['js'],
      bin: ['bin'],
      build: ['js', 'dist', 'bin'],
      private: {
        options: {
          force: true
        },
        src: [privateDirectory + branch + '/*.js']
      }
    }
  });

  grunt.registerTask('build', [
    'clean:build',
    'ts', // bin - compile
    'ts_clean', // bin - cleaning
    'file_append:versioning', // bin - versioning
    'copy:screeps', // bin->js - flattening
    'webpack:bundle' // js->dist - packing
  ]);

  grunt.registerTask('private', ['build', 'clean:private', 'copy:jsToPrivate', 'copy:distToPrivate']);

  grunt.registerTask('public', ['build', 'screeps:jsToPublic', 'screeps:distToPublic']);

  grunt.registerTask('both', [
    'build',
    'clean:private',
    'copy:jsToPrivate',
    'copy:distToPrivate',
    'screeps:jsToPublic',
    'screeps:distToPublic'
  ]);
};
