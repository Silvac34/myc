module.exports = function(grunt) {

    // Load the ng-constant grunt task
    grunt.loadNpmTasks('grunt-ng-constant');
    grunt.loadNpmTasks('grunt-git');
    require('load-grunt-tasks')(grunt);

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
            },
            
            stage: {
                constants: {
                    ENV: grunt.file.readJSON('app/config/stage.json')
                }
            },
            devDim: {
                constants: {
                    ENV: grunt.file.readJSON('app/config/devDim.json')
                }
            },
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
                    remote: 'prod',
                    branch: 'master'

                }
            }

        },


        shell: {
            PushProdBuild: {
                command: 'git push --force prod buildingAndDeploy:master',
                options: {
                }
            },
            PushStageBuild: {
                command: 'git push --force stage buildingAndDeploy:master',
                options: {
                }
            }
        },


    });


    grunt.registerTask('devKev', [
        // This will generate the configuration file for the environment
        'ngconstant:devKev'
    ]);
    grunt.registerTask('devDim', [
        // This will generate the configuration file for the environment
        'ngconstant:devDim'
    ]);
    

    // Grunt task to build your source code for deployment to production
    grunt.registerTask('Prod', [
        'gitcheckout:branchDeploy', 'ngconstant:production', 'gitadd:Conf', 'gitcommit:Conf', 'shell:PushProdBuild'
    ]);
    
    grunt.registerTask('Stage', [
        'gitcheckout:branchDeploy', 'ngconstant:stage', 'gitadd:Conf', 'gitcommit:Conf', 'shell:PushStageBuild'
    ]);

    grunt.registerTask('ProdKev', [
        // This will build and deploy the app to prod and reset config for devKev environment
        'Prod', 'gitcheckout:DevKev', 'devKev'
    ]);
    
    grunt.registerTask('StageKev', [
        // This will build and deploy the app to stage and reset config for devKev environment
        'Stage', 'gitcheckout:DevKev', 'devKev'
    ]);
    
    grunt.registerTask('ProdDim', [
        // This will build and deploy the app to prod and reset config for devDim environment
        'Prod', 'gitcheckout:DevDim', 'devDim'
    ]);
    
    grunt.registerTask('StageDim', [
        // This will build and deploy the app to stage and reset config for devDim environment
        'Stage', 'gitcheckout:DevDim', 'devDim'
    ]);


};