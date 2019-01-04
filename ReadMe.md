#Developers enboarding

##Step 1 - Provide a ubuntu based environment

### If you're using Vagrant
Download and set up vagrant http://vagrantup.com
Make sure that it is on your PATH

Once it is downloaded and on your PATH, execute the following command in
the project's directory
```
vagrant up
```
You will be able to connect to the virtual machine with the following command:
```
vagrant ssh
```
to access the shared folder (ie the project directory) from within the VM use the following
command
```
cd /vagrant
```

##Step2 - Provision the environment
Once you have an Ubuntu environment set up, enter the following command
from your project's root directory
```
chmod +x ./Provision.sh
./Provision.sh
```
It will provision the development environment with everything it needs: it's
our development stack
When a new module is added, it is safe to enter
```
./Provision.sh
```
to make sure that the development stack contains everything it should

##Step3 - Set up environment configuration
### Server Side
In order for the app to run prorely, it is necessary to define an 
environment variable that will be used to set the environment's configuration

For example: to set the environment variable that says that will load the DevelopmentConfig configuration
```
echo "export APP_SETTINGS=DevelopmentConfig" >> ~/.profile
```
The list of configuration is available in ./configure.py

If you want to use a database as a service such as Mlab, change the MONGOLAB_URI variable

You 'll need to restart your VM in order for this command to be fully
taken into account

If you have a problem with the DB in development:
1) open mongo by entering in the console
mongod
2) open a new terminal and enter
mongo
3) In this terminal enter
db = connect('ds135700.mlab.com:35700/mycommuneaty_dev_test')
4) Connect as admin to the database
db.auth('dkohn','mdp')
5) drop the database
db.dropDatabase()
6) exit

### Client side 
The environment configuration for the front-end are in the folder app/config
From this configuration, we will program grunt to generate a module config.js that holds the configuration
The following command generate config.js
```
grunt NameOfYourEnv 
```
You can add a new environment configuration by adding a file in app/config and by editing the Gruntfile.js


##Step 4 : Launch the app in your dev environment
enter the following command in the project directory inside the guest machine
```
python app/run.py
```
If you are using vagrant:
The app will be available at http://localhost:1234/

If not, the port used by the server is 8080

You're good to go!!!!


# Backend's API Documentation

Server Side API documentation is available at http://docs.shareat.apiary.io/# 

# Databases management

https://mlab.com
Username : myCommuneaty

#Application Deployment and Workflow

##Deploy the app to the staging and the Production Environments

###First deployment - Setting up the staging environments

You first have to create a Heroku account

Then enter the following command in your project's directory
```
heroku login
```
Heroku will ask you about your credential

We are first going to create the staging environment.

You have to enter the following command to create an Heroku app, and provide it
with the proper environment (buildpacks)

```
heroku create shareat123-stage
heroku buildpacks:set heroku/python --app shareat123-stage
heroku buildpacks:add --index 2 heroku/nodejs --app shareat123-stage
```
The following command set the environment variable so that we know that we are
in the staging environment
```
heroku config:set APP_SETTINGS=StagingConfig --app shareat123-stage
```

###First deployment - Setting up the production environments

Same thing as for the staging environment

You then have to enter the following command to create an Heroku app, and provide it
with the proper environment (buildpacks)

```
heroku create mycommuneaty
heroku buildpacks:set heroku/python --app mycommuneaty
heroku buildpacks:add --index 2 heroku/nodejs --app mycommuneaty
```
The following command set the environment variable so that we know that we are
in the staging environment
```
heroku config:set APP_SETTINGS=ProductionConfig --app mycommuneaty
```

###Deploy the app
#### If you've never been connected via ssh with heroku
If you don't have a ssh key:
```
ssh-keygen -t rsa
```
Then add this new key to heroku
```
heroku keys:add
```

From your project directory
To deploy the app to the staging environment:
```
git remote add stage git@heroku.com:shareat123-stage.git
grunt StageDim
```
The grunt command build the app of the current branch with the staging configuration, push it to the staging
environment and reinitialise the config.js file for the DevDim environment. These 
actions are defined in the Gruntfile.js

Your app will be available at https://shareat123-stage.herokuapp.com


To deploy the app to the production environment
```
git remote add prod git@heroku.com:mycommuneaty.git
grunt ProdDim
```
The grunt command build the app of the current branch with the production configuration, push it to the production
environment and reinitialise the config.js file for the DevDim environment. These 
actions are defined in the Gruntfile.js

Your app will be available at https://mycommuneaty.herokuapp.com

##Development and Deployment Workflow :

###Git repository and branches :
- Master : La dernière version stable du code (le code aura été testé sur l’environnement de staging).
- Prod : Le code déployé dans l’environnement de production
- funcbranch : Branche sur laquelle on développe une nouvelle fonctionnalité. On mergera cette branche avec le master lorsque la fonctionnalité sera complète et testée sur l'environnement de staging
- funcbranchKev :  Branche de dev de Kevin sur la nouvelle fonctionnalité

### Development and commit workflow :

-	Je souhaite créer une nouvelle fonctionnalité, je crée un nouvelle branche distante sur BitBucket
-	Je pull cette branche sur mon environment de développement local puis je crée une branche de dev.
```
git fetch && git checkout funcbranch && git checkout -b funcbranchKev
```

- Je développe une sous fonctionnalité, je la commit puis je la pousse vers le repository distant. A partir de BitBucket, je crée un pull
request entre funcbranchKev et funcbranch

- La pull request fera l'objet d'une revue par les autres développeurs avant d'être mergé avec funcbranch. Chaque revue devra obligatoirement 
comporter un test en environnement de staging
```
git pull funcbranchKev
grunt StageDim
```
- Lorsque le développement de la nouvelle fonctionnalité est terminé, je vérifie le bon fonctionnement de funcbranch en environnement de staging

- Je crée une pull request entre funcbranch et master, puis je gère les conflits.

- Une fois que tous les conflits ont été levés et que la pull request a été approuvée par les autres développeurs, je sync funcbranch
avec le master dans l'objectif de tester l'ensemble de la branch funcbranch sur l'environment de staging

- Une fois les tests sont conformes aux attentes, je merge la pull request

# Utilisation de redis et celery
voir le dashboard du serveur redis (addon heoku) qui effectue les tâches en backend ici: 
 https://dashboard.heroku.com/apps/mycommuneaty/resources

# Directory Layout

```
app/                    --> all of the source files for the application
  config/                 --> holds the environment configurations for the front-end 
  static/
    components/           --> all app specific modules
      version/              --> version related components
        version.js                 --> version module declaration and basic "version" value service
        version_test.js            --> "version" value service tests
        version-directive.js       --> custom directive that returns the current app version
        version-directive_test.js  --> version directive tests
        interpolate-filter.js      --> custom interpolation filter
        interpolate-filter_test.js --> interpolate filter tests
    css/                            --> all the app's stylesheets
    viewCreateMeal/                --> the Create meal view template and logic
      viewCreateMeal.html            --> the partial template
      viewCreateMeal.js              --> the controller logic
      viewCreateMeal_test.js         --> tests of the controller
    viewFbLogin/                --> the facebook login view template and logic
    viewMeals/                --> the visualisation of meals view template and logic
    viewMyMeals               -->So the user can see and manage the meals he is attending
    view_test/                --> Juste to keep as a template. Is not used in the app
    app.js                --> main application module
    config.js             --> holds the front end configuration (it depends on the environment) This file is generated by grunt
  templates/
    index.html            --> app layout file (the main html template file of the app)
    index-async.html      --> just like index.html, but loads js files asynchronously
  _init_.py               --> to create a python module
  api.py                  --> Python Flask Web App file
  configure.py            --> holds the configuration settings depending on the environment
  DevData.py              --> File used to populate the database with mock data (juste for dev purpose)
  DatataModel_example_file.json    --> It is not used in the app, it is here to illustrate the app's data model
test/
  backend_tests/
    test.py               --> Unit test for the backend part of the App (Python Flask)
  e2e-tests/            --> end-to-end tests (NOT YET)
    protractor-conf.js    --> Protractor config file
    scenarios.js          --> end-to-end scenarios to be run by Protractor
Gruntfile.js             --> Contains the instruction for Grunt automated tasks
karma.conf.js         --> config file for running unit tests with Karma
.gitignore            --> Files to ignore in git
bower.json            --> bower dependencies
package.json            --> NPM dependencies
Procfile              --> File needed for heroku
Provision.sh          --> File to provision the vagrant VM
requirements.txt      --> File to declare Python dependencies
Vagrantfile           --> File to configure the vagrant VM
```

# Testing

There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

## Running Unit Tests For the Back-End
The tests use python unittest

Enter the following command in your project directory on the guest machine
```
python test/backend_tests/test.py
```
For now, the test can only be executed in the development environment

## Running Unit Tests For the Front-End

The angular-seed app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```

#fron-end datas
source for loading-bar : https://github.com/chieffancypants/angular-loading-bar


## End to end testing (Not used Yet)

The angular-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


# Contact

For more information on AngularJS please check out http://angularjs.org/

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server

# Package json old
script ancien pour npm : 
"start": "http-server -a localhost -p 8000 -c-1",