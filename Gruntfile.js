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
            },
            InitStageDB : {
                command: [
                    'mongo ds019498.mlab.com:19498/shareat_stage -u shareat -p kmaillet230191 --eval "db.users.remove({})"',
                    'mongo ds019498.mlab.com:19498/shareat_stage -u shareat -p kmaillet230191 --eval "db.meals.remove({})"',
                    'mongoimport -h ds019498.mlab.com:19498 -d shareat_stage -c meals -u shareat -p kmaillet230191 --file test/testData/meals_testData.json',
                    'mongoimport -h ds019498.mlab.com:19498 -d shareat_stage -c users -u shareat -p kmaillet230191 --file test/testData/users_testData.json'
                    ].join('&&')
            },
            InitDevKevDB: {
                command: [
                    'mongo ds019498.mlab.com:19498/shareat_dev -u shareat -p kmaillet230191 --eval "db.users.remove({})"',
                    'mongo ds019498.mlab.com:19498/shareat_dev -u shareat -p kmaillet230191 --eval "db.meals.remove({})"',
                    'mongoimport -h ds019498.mlab.com:19498 -d shareat_dev -c meals -u shareat -p kmaillet230191 --file test/testData/meals_testData.json',
                    'mongoimport -h ds019498.mlab.com:19498 -d shareat_dev -c users -u shareat -p kmaillet230191 --file test/testData/users_testData.json'
                ].join('&&')
            },
            InitDevDimDB: {
                command: [
                    'mongo ds055782.mlab.com:55782/shareat-dev_dim -u shareat -p kmaillet230191 --eval "db.users.remove({})"',
                    'mongo ds055782.mlab.com:55782/shareat-dev_dim -u shareat -p kmaillet230191 --eval "db.meals.remove({})"',
                    'mongoimport -h ds055782.mlab.com:55782 -d shareat-dev_dim -c meals -u shareat -p kmaillet230191 --file test/testData/meals_testData.json',
                    'mongoimport -h ds055782.mlab.com:55782 -d shareat-dev_dim -c users -u shareat -p kmaillet230191 --file test/testData/users_testData.json'
                ].join('&&')
            }
        },


    });

// Create Front End Configuration file for the environment --------------------------------------------------------------------------------------------------
    grunt.registerTask('devKev', [
        // This will generate the configuration file for the environment
        'ngconstant:devKev'
    ]);
    grunt.registerTask('devDim', [
        // This will generate the configuration file for the environment
        'ngconstant:devDim'
    ]);
    

// Grunt task to build your source code for deployment to production ------------------------------------------------------------------------------------
    grunt.registerTask('Prod', [
        'gitcheckout:branchDeploy', 'ngconstant:production', 'gitadd:Conf', 'gitcommit:Conf', 'shell:PushProdBuild'
    ]);
    
    grunt.registerTask('Stage', [
        'gitcheckout:branchDeploy', 'ngconstant:stage', 'gitadd:Conf', 'gitcommit:Conf', 'shell:PushStageBuild', 'shell:InitStageDB'
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
        'Prod', 'gitcheckout:master', 'devDim'
    ]);
    
    grunt.registerTask('StageDim', [
        // This will build and deploy the app to stage and reset config for devDim environment
        'Stage', 'gitcheckout:master', 'devDim'
    ]);


};