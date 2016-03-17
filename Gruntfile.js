module.exports = function(grunt) {

    // Load the ng-constant grunt task
    grunt.loadNpmTasks('grunt-ng-constant');
    grunt.loadNpmTasks('grunt-git');

    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'dist'
        },
        //Setup environment variables
        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                // What your module gets wrapped in. It is helpful to include a                code comment for anyone that starts to edit the generated module file.
                wrap: '\'use strict\';\n// THIS FILE IS AUTO-GENERATED! EDITS               WILL NOT PERSIST!\n// Make edits in the appropriate JSON            file under ./config\n{%= __ngModule %}',
                // Name of your generated module
                name: 'config',
                // For the yeoman build process we will use the same destination     for both environments for the angular module file
                dest: '<%= yeoman.app %>/static/config.js'
            },
            // Environment targets
            devKev: {
                // Key-values created as Angular Constants
                constants: {
                    // This JSON file will be available in the app under the ENV              variable
                    ENV: grunt.file.readJSON('app/config/devKev.json')
                }
            },
            production: {
                constants: {
                    ENV: grunt.file.readJSON('app/config/production.json')
                }
            }
        },

        gitcheckout: {
            branchDeploy: {
                options: {
                    branch: 'buildingAndDeploy',
                    overwrite: true
                }
            },
            master: {
                options: {
                    branch: 'master',
                    overwrite: false
                }
            },
            DevKev: {
                options: {
                    branch: 'DevKev',
                    overwrite: false
                }
            }
        },

        gitadd: {
            Conf: {
                options: {
                    force: true
                },
                files: {
                    src: ['app/static/config.js']
                }
            }
        },

        gitcommit: {
            Conf: {
                options: {

                },
                files: {
                    src: ['app/static/config.js']
                }
            }
        },

        gitpush: {
            stage: {
                options: {
                    remote: 'stage',
                    branch: 'master',
                    force: 'true'
                }
            },
            prod: {
                options: {
                    remote: 'prod'
                    //branch: 'master'
                    
                }
            }

        },


    });



    // Grunt task to run your local development server
    grunt.registerTask('devKev', [
        // This will generate the module file for development
        'ngconstant:devKev'
    ]);

    // Grunt task to build your source code for deployment to production
    grunt.registerTask('Prod', [
        // This will generate the module file for production
        'gitcheckout:branchDeploy', 'ngconstant:production', 'gitadd:Conf', 'gitcommit:Conf', 'gitpush:prod'
    ]);

    grunt.registerTask('ProdKev', [
        // This will generate the module file for production
        'Prod', 'gitcheckout:DevKev','devKev'
    ]);


};