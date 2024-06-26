/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
**/

/*jslint node: true */
'use strict';

var pkg = require('./package.json');
var SEQUENT_CONFIG_VERSION = 'master';

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function(fileTypePatterns)
{
  fileTypePatterns = Array.isArray(fileTypePatterns) ?
    fileTypePatterns :
    [fileTypePatterns];
  var ignore = [
    'node_modules',
    'dist',
    'temp', 
    'env'
  ];
  var fs = require('fs');
  return fs
    .readdirSync(process.cwd())
    .map(
      function(file)
      {
        if (
          ignore.indexOf(file) !== -1 ||
          file.indexOf('.') === 0 ||
          !fs.lstatSync(file).isDirectory()
        ) {
          return null;
        } else {
          return fileTypePatterns
            .map(
              function(pattern) {
                return file + '/**/' + pattern;
              }
            );
        }
      }
    )
    .filter(function(patterns) { return patterns; })
    .concat(fileTypePatterns);
};

module.exports = function (grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // custom grunt task to check SequentConfig.js
  grunt.registerTask('check_config', function() {
    var fs = require('fs');
    var done = this.async();
    grunt.log.ok('Checking SequentConfig.js...');
    var conf = fs.readFile('SequentConfig.js', function(err, data) {
        if (err) {
            grunt.log.error('No SequentConfig.js file found');
            done(false);
        } else {
            var match = data.toString().match(/SEQUENT_CONFIG_VERSION = [\'\"]([\w\.\-]*)[\'\"];/);
            if (!match) {
                grunt.log.error('Invalid SequentConfig.js version');
            } else {
                var v = match[1];
                if (v === SEQUENT_CONFIG_VERSION) {
                    return done();
                } else {
                    grunt.log.error('Invalid SequentConfig.js version: ' + v);
                }
            }
            done(false);
        }
    });
  });

  // custom grunt task to check SequentPluginsConfig.js
  grunt.registerTask('check_plugins_config', function() {
    var fs = require('fs');
    var done = this.async();
    grunt.log.ok('Checking SequentPluginsConfig.js...');
    function checkAvPluginsConfig() {
        fs.readFile('SequentPluginsConfig.js', function(err, data) {
            if (err) {
                grunt.log.ok('No SequentPluginsConfig.js file found, creating...');
                var SequentPluginsConfigText =
                    "var SEQUENT_PLUGINS_CONFIG_VERSION = '" + SEQUENT_CONFIG_VERSION + "';\n" +
                    "angular.module('SequentPluginsConfig', [])\n" +
                    "  .factory('PluginsConfigService', function() {\n" +
                    "    return {};\n" +
                    "  });\n" +
                    "\n" +
                    "angular.module('SequentPluginsConfig')\n" +
                    "  .provider('PluginsConfigService', function PluginsConfigServiceProvider() {\n" +
                    "    _.extend(this, {});\n" +
                    "\n" +
                    "    this.$get = [function PluginsConfigServiceProviderFactory() {\n" +
                    "    return new PluginsConfigServiceProvider();\n" +
                    "    }];\n" +
                    "   });";
                fs.writeFile("SequentPluginsConfig.js",
                    SequentPluginsConfigText,
                    function(err) {
                        if(err) {
                            grunt.log.error(
                                'Error creating SequentPluginsConfig.js file');
                            done(false);
                        } else {
                            grunt.log.ok('Created SequentPluginsConfig.js file, ' +
                                'trying to read it again...');
                            checkAvPluginsConfig();
                        }
                });
            } else {
                var match = data.toString().match(
                    /SEQUENT_PLUGINS_CONFIG_VERSION = [\'\"]([\w\.\-]*)[\'\"];/);
                if (!match) {
                    grunt.log.error('Invalid SequentPluginsConfig.js version');
                } else {
                    var v = match[1];
                    if (v === SEQUENT_CONFIG_VERSION) {
                        return done();
                    } else {
                        grunt.log.error('Invalid SequentPluginsConfig.js version: ' +
                            v);
                    }
                }
                done(false);
            }
        });
    }
    var conf = checkAvPluginsConfig();
  });

  // Project configuration.
  grunt.initConfig({
    variables: {
      admin_html_body_include: ''
    },
    connect: {
      main: {
        options: {
          port: 9001
        }
      }
    },
    watch: {
      main: {
        options: {
            livereload: true,
            livereloadOnError: false,
            spawn: false
        },
        files: [createFolderGlobs(['*.js','*.less','*.html']),'!_SpecRunner.html','!.grunt'],
        tasks: [] //all the tasks are run dynamically during the watch event handler
      }
    },
    jshint: {
      main: {
        options: {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish'),
            ignores: [
                'vendor/hopscotch-0.3.1/js/hopscotch.js'
            ]

        },
        src: createFolderGlobs('*.js')
      }
    },
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    },
    less: {
      production: {
        options: {
        },
        files: [{
          expand: true,
          src: ['node_modules/common-ui/themes/**/app.less', 'plugins/**/*.less'],
          dest: 'temp/',
          ext: '.css',
        }]
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')()
        ]
      },
      dist: {
        src: 'temp/node_modules/common-ui/themes/**/app.css'
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: pkg.name,
            htmlmin:'<%= htmlmin.main.options %>'
        },
        src: [createFolderGlobs('*.html'),'!index.html','!_SpecRunner.html'],
        dest: 'temp/templates.js'
      },
      common: {
        options: {
            module: pkg.name,
            htmlmin:'<%= htmlmin.main.options %>'
        },
        cwd: 'node_modules/common-ui',
        src: ["avRegistration/**/*.html", "avUi/**/*.html" ],
        dest: 'temp/templates-common.js'
      }
    },
    copy: {
      temp: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/nanoscroller/bin/css/', 
            src: ['*'],
            dest: 'temp/node_modules/common-ui/'
          },
          {
            expand: true,
            cwd: 'node_modules/intl-tel-input/build/css/', 
            src: ['*'],
            dest: 'temp/node_modules/common-ui/'
          }
        ]
      },
      main: {
        files: [
          {src: ['img/**'], dest: 'dist/'},
          {
              expand: true,
              cwd:'vendor/hopscotch-0.3.1/img/',
              src: ['**'],
              dest: 'dist/img/'
          },
          {src: ['img/**'], dest: 'dist/'},
          {src: ['temp_data/**'], dest: 'dist/'},
          {src: ['node_modules/common-ui/dist/img/flags.png'], dest: 'dist/img/flags.png'},
          {src: ['node_modules/common-ui/dist/utils.js'], dest: 'dist/utils.js'},
          {src: ['node_modules/common-ui/dist/intlTelInput.css'], dest: 'dist/intlTelInput.css'},
          {src: ['node_modules/angular-moment-picker/dist/angular-moment-picker.min.css'], dest: 'dist/angular-moment-picker.min.css'},
          {
            expand: true,
            cwd:'node_modules/common-ui/themes',
            src: ['**/*.png'],
            dest: 'dist/themes/',
            ext: '.png',
            extDot: 'first'
          },
          {
            expand: true,
            cwd: 'node_modules/bootstrap/fonts/',
            src: ['**'],
            dest: 'dist/themes/fonts/'
          },
          {
            expand: true,
            cwd: 'node_modules/bootstrap/fonts/',
            src: ['**'],
            dest: 'dist/themes/fonts/'
          },
          {
            expand: true,
            cwd: 'node_modules/font-awesome/fonts/',
            src: ['**'],
            dest: 'dist/fonts/'
          },
          {
            src: ['node_modules/common-ui/dist/fonts/Manrope-VariableFont_wght.ttf'],
            dest: 'dist/fonts/Manrope-VariableFont_wght.ttf'
          }
          //{src: ['node_modules/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
          //{src: ['node_modules/select2/*.png','node_modules/select2/*.gif'], dest:'dist/css/',flatten:true,expand:true},
          //{src: ['node_modules/angular-mocks/angular-mocks.js'], dest: 'dist/'}
        ]
      }
    },
    dom_munger:{
      read: {
        options: {
          read:[
            {selector:'script[class="libnocompat"]',attribute:'src',writeto:'libnocompatjs'},
            {selector:'script[class="lib"]',attribute:'src',writeto:'libjs'},
            {selector:'script[class="app"]',attribute:'src',writeto:'appjs'},
            {selector:'link[rel="stylesheet"][data-concat!="false"]',attribute:'href',writeto:'appcss'}
          ]
        },
        src: 'index.html'
      },
      update: {
        options: {
          remove: ['script[data-remove!="false"]','link[data-remove!="false"]'],
          append: [
            {selector:'head',html:'<link class="favicon" rel="icon" href="/admin/img/cropped-FAV-6-32x32.png" sizes="32x32" />'},
            {selector:'head',html:'<link class="favicon" rel="icon" href="/admin/img/cropped-FAV-6-192x192.png" sizes="192x192" />'},
            {selector:'head',html:'<link class="favicon" rel="apple-touch-icon" href="/admin/img/cropped-FAV-6-180x180.png" />'},
            {selector:'body',html:'<%= variables.admin_html_body_include %>'},
            {selector:'body',html:'<!--[if lte IE 8]><script src="/admin/libcompat-vmaster.min.js"></script><![endif]--><!--[if gte IE 9]><script src="/admin/libnocompat-vmaster.min.js"></script><![endif]--><!--[if !IE]><!--><script src="/admin/libnocompat-vmaster.min.js"></script><!--<![endif]-->'},
            {selector:'body',html:'<!--All the source code of this program under copyright. Take a look at the license details at https://github.com/sequent/sequent-core-view/blob/master/README.md -->'},
            {selector:'body',html:'<script src="/admin/lib-vmaster.min.js"></script>'},
            {selector:'body',html:'<script src="/admin/SequentConfig-vmaster.js"></script>'},
            {selector:'body',html:'<script src="/admin/SequentThemes-vmaster.js"></script>'},
            {selector:'body',html:'<script src="/admin/app-vmaster.min.js"></script>'},
            {selector:'body',html:'<script src="/admin/SequentPlugins-vmaster.js"></script>'},
            {selector:'head',html:'<link rel="stylesheet" id="theme" data-base="/admin/" href="/admin/themes/default/app.min.css">'},
            {selector:'head',html:'<link rel="stylesheet" id="plugins" data-base="/admin/" href="/admin/plugins.css">'},
            {selector:'head',html:'<link rel="stylesheet" id="vendor-css" data-base="/admin/" href="/admin/vendor.min.css">'},
            {selector:'head',html:'<link rel="stylesheet" href="/admin/intlTelInput.css" />'},
            {selector:'head',html:'<link rel="stylesheet" href="/admin/angular-moment-picker.min.css" />'}
          ]
        },
        src:'index.html',
        dest: 'dist/index.html'
      }
    },
    cssmin: {
      main: {
        files: [
            {
                expand: true,
                cwd:'temp/node_modules/common-ui/themes',
                src: ['**/app.css'],
                dest: 'dist/themes/',
                ext: '.min.css',
                extDot: 'first'
            },
            {
                src: ['vendor/hopscotch-0.3.1/css/hopscotch.css'],
                dest: 'dist/vendor.min.css'
            }
        ]
      },
    },
    concat: {
      main: {
        files: {
          'dist/plugins.css': ['temp/plugins/**/*.css'],
          'dist/vendor.css': [
            'vendor/hopscotch-0.3.1/css/hopscotch.css'
          ],
          'temp/libcompat.js': [
            'vendor/jquery.compat/jquery-1.11.1.js',
            'vendor/json3/json-v3.3.2.js',
            'vendor/crypto/unsupportedBrowser.js'
          ],
          'temp/libnocompat.js': ['<%= dom_munger.data.libnocompatjs %>'],
          'temp/lib.js': ['<%= dom_munger.data.libjs %>'],
          'temp/app.js': ['<%= dom_munger.data.appjs %>','<%= ngtemplates.main.dest %>','<%= ngtemplates.common.dest %>'],
          'dist/SequentConfig-vmaster.js': ['SequentConfig.js'],
          'dist/SequentThemes-vmaster.js': ['node_modules/common-ui/dist/SequentThemes-vmaster.js'],
          'dist/SequentPlugins-vmaster.js': [
            'SequentPluginsConfig.js',
            'plugins/**/*.js',
            '!plugins/**/*-spec.js'
          ]
        }
      }
    },
    "merge-json": {
      main: {
        files: {
          "dist/locales/en.json": [
            "locales/en.json", 
            "plugins/**/locales/en.json", 
            "node_modules/common-ui/dist/locales/en.json"
          ],
          "dist/locales/es.json": [
            "locales/es.json", 
            "plugins/**/locales/es.json", 
            "node_modules/common-ui/dist/locales/es.json"
          ],
          "dist/locales/fr.json": [
            "locales/fr.json", 
            "plugins/**/locales/fr.json", 
            "node_modules/common-ui/dist/locales/fr.json"
          ],
          "dist/locales/it.json": [
            "locales/it.json", 
            "plugins/**/locales/it.json", 
            "node_modules/common-ui/dist/locales/it.json"
          ],
          "dist/locales/gl.json": [
            "locales/gl.json", 
            "plugins/**/locales/gl.json", 
            "node_modules/common-ui/dist/locales/gl.json"
          ],
          "dist/locales/ca.json": [
            "locales/ca.json", 
            "plugins/**/locales/ca.json", 
            "node_modules/common-ui/dist/locales/ca.json"
          ]
        }
      }
    },
    ngAnnotate: {
      main: {
        files: {
        'temp/app.js':['temp/app.js'],
        'temp/libnocompat.js': ['temp/libnocompat.js'],
        'temp/libcompat.js': ['temp/libcompat.js']
        }
      }
    },
    uglify: {
      main: {
        options:{
          mangle: false,
          compress: {},
          beautify: true
        },
        files: {
          'dist/app-vmaster.min.js': 'temp/app.js',
          'dist/lib-vmaster.min.js': 'temp/lib.js',
          'dist/libnocompat-vmaster.min.js': 'temp/libnocompat.js',
          'dist/libcompat-vmaster.min.js': 'temp/libcompat.js',
          'dist/avWidgets.min.js': 'avWidgets.js',

          "dist/locales/moment/en.js": "node_modules/moment/locale/en-gb.js",
          "dist/locales/moment/es.js": "node_modules/moment/locale/es.js",
          "dist/locales/moment/fr.js": "node_modules/moment/locale/fr.js",
          "dist/locales/moment/it.js": "node_modules/moment/locale/it.js",
          "dist/locales/moment/gl.js": "node_modules/moment/locale/gl.js",
          "dist/locales/moment/ca.js": "node_modules/moment/locale/ca.js"          
        }
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false,
          removeComments: false,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    karma: {
      options: {
        frameworks: ['jasmine'],
        files: [  //this files data is also updated in the watch handler, if updated change there too
          '<%= dom_munger.data.libnocompatjs %>',
          '<%= dom_munger.data.libjs %>',
          'SequentConfig.js',
          'SequentPluginsConfig.js',
          'SequentThemes.js',
          'avWidgets.js',
          '<%= dom_munger.data.appjs %>',
          '<%= ngtemplates.main.dest %>',
          '<%= ngtemplates.common.dest %>',
          'node_modules/angular-mocks/angular-mocks.js',
          'plugins/**/*.js',
          createFolderGlobs('*-spec.js')
        ],
        logLevel:'ERROR',
        reporters:['mocha'],
        autoWatch: false, //watching is handled by grunt-contrib-watch
        singleRun: true
      },
      all_tests: {
        browsers: ['PhantomJS','Chrome','Firefox']
      },
      // If server is headless, Chrome and Firefox cannot be used
      headless: {
        browsers: ['PhantomJS']
      },
      during_watch: {
        browsers: ['PhantomJS']
      },
    },
    protractor: {
      options: {
        // protractor config file
        configFile: "test/e2e.conf.js",
        // If false, the grunt process stops when the test fails
        keepAlive: false,
        // If true, protractor will not use colors in its output
        noColor: false,
        args: {}
      },
      all: {
        options: {
          // Target-specific config file
          configFile: "test/e2e.conf.js",
        }
      },
    }
  });

  /*
   * Register the tasks
   */
  grunt.registerTask(
    'build',
    [
      'check_config',
      'check_plugins_config',
      'jshint',
      'clean:before',
      'copy:temp',
      'less',
      'postcss',
      'dom_munger',
      'ngtemplates',
      'cssmin',
      'concat',
      'merge-json',
      'ngAnnotate',
      'uglify',
      'copy',
      'htmlmin',
      'clean:after'
    ]
  );
  grunt.registerTask('serve', ['dom_munger:read','jshint','connect', 'watch']);
  grunt.registerTask('test',['dom_munger:read','karma:headless']);
  grunt.registerTask('test-all',['dom_munger:read','karma:all_tests']);


  grunt.event.on('watch', function(action, filepath) {
    //https://github.com/gruntjs/grunt-contrib-watch/issues/156

    var tasksToRun = [];

    if ((filepath.lastIndexOf('.json') !== -1 && filepath.lastIndexOf('.json') === filepath.length - 5) ||
        (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3)) {

      //lint the changed js file
      grunt.config('jshint.main.src', filepath);
      tasksToRun.push('jshint');

      //find the appropriate unit test for the changed file
      var spec = filepath;
      if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
        spec = filepath.substring(0,filepath.length - 3) + '-spec.js';
      }

      //if the spec exists then lets run it
      if (grunt.file.exists(spec)) {
        var files = [].concat(grunt.config('dom_munger.data.libnocompatjs'));
        files.concat(grunt.config('dom_munger.data.libjs'));
        files.push('node_modules/angular-mocks/angular-mocks.js');
        files.push('SequentConfig.js');
        files.push('SequentPluginsConfig.js');
        files.push('SequentThemes.js');
        files.push('avWidgets.js');
        files.concat(grunt.config('dom_munger.data.appjs'));
        files.concat(grunt.config('ngtemplates.main.dest'));
        files.push(spec);
        grunt.config('karma.options.files', files);
        tasksToRun.push('karma:during_watch');
      }
    }

    //if index.html changed, we need to reread the <script> tags so our next run of karma
    //will have the correct environment
    if (filepath === 'index.html') {
      tasksToRun.push('dom_munger:read');
    }

    grunt.config('watch.main.tasks',tasksToRun);

  });

  grunt.loadNpmTasks('grunt-protractor-runner');
};
