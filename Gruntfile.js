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
                command: [
                    'git push --force prod buildingAndDeploy:master',
                    'heroku addons | grep heroku-redis',
                    'heroku addons:create heroku-redis:hobby-dev -a mycommuneaty',
                    'heroku config --remote prod | grep REDIS'
                    ].join('&&'),
                options: {
                }
            },
            PushStageBuild: {
                command: [
                    'git push --force stage buildingAndDeploy:master',
                    'heroku addons | grep heroku-redis',
                    'heroku addons:create heroku-redis:hobby-dev -a shareat123-stage',
                    'heroku config --remote stage | grep REDIS'
                    ].join('&&'),
                options: {
                }
            },
            InitStageDB : {
                command: [
                    'mongo ds129600.mlab.com:29600/mycommuneatydb_stage -u dkohn -p SharEat3santiago --eval "db.users.remove({})"',
                    'mongo ds129600.mlab.com:29600/mycommuneatydb_stage -u dkohn -p SharEat3santiago --eval "db.meals.remove({})"',
                    'mongoimport -h ds129600.mlab.com:29600 -d mycommuneatydb_stage -c meals -u dkohn -p SharEat3santiago --file test/testData/meals_testData.json --jsonArray',
                    'mongoimport -h ds129600.mlab.com:29600 -d mycommuneatydb_stage -c users -u dkohn -p SharEat3santiago --file test/testData/users_testData.json --jsonArray'
                    ].join('&&')
            },
            InitDevDimDB: {
                command: [
                    'mongo ds131320.mlab.com:31320/mycommuneatydb_dev -u dkohn -p SharEat3santiago --eval "db.users.remove({})"',
                    'mongo ds131320.mlab.com:31320/mycommuneatydb_dev -u dkohn -p SharEat3santiago --eval "db.meals.remove({})"',
                    'mongo ds131320.mlab.com:31320/mycommuneatydb_dev -u dkohn -p SharEat3santiago --eval "db.reviews.remove({})"',
                    'mongoimport -h ds131320.mlab.com:31320 -d mycommuneatydb_dev -c meals -u dkohn -p SharEat3santiago --file test/testData/meals_testData.json --jsonArray',
                    'mongoimport -h ds131320.mlab.com:31320 -d mycommuneatydb_dev -c users -u dkohn -p SharEat3santiago --file test/testData/users_testData.json --jsonArray'
                ].join('&&')
            },
            InitDevTestDB: {
                command: [
                    'mongo ds135700.mlab.com:35700/mycommuneaty_dev_test -u dkohn -p SharEat3santiago --eval "db.users.remove({})"',
                    'mongo ds135700.mlab.com:35700/mycommuneaty_dev_test -u dkohn -p SharEat3santiago --eval "db.meals.remove({})"',
                    'mongoimport -h ds135700.mlab.com:35700 -d mycommuneaty_dev_test -c meals -u dkohn -p SharEat3santiago --file test/testData/meals_testData.json --jsonArray',
                    'mongoimport -h ds135700.mlab.com:35700 -d mycommuneaty_dev_test -c users -u dkohn -p SharEat3santiago --file test/testData/users_testData.json --jsonArray'
                ].join('&&')
            }
        },


    });

// Create Front End Configuration file for the environment --------------------------------------------------------------------------------------------------
    grunt.registerTask('initDevDimDB', [
        // This will generate the configuration file for the environment
        'shell:InitDevDimDB'
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
    
    grunt.registerTask('ProdDim', [
        // This will build and deploy the app to prod and reset config for devDim environment
        'Prod', 'gitcheckout:master', 'devDim'
    ]);
    
    grunt.registerTask('StageDim', [
        // This will build and deploy the app to stage and reset config for devDim environment
        'Stage', 'gitcheckout:master', 'devDim'
    ]);


};
