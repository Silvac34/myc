#SharEat Project

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


##Step 4 : Launch the app in your dev environment
enter the following command in the project directory inside the guest machine
```
python app/api.py
```
If you are using vagrant:
The app will be available at http://localhost:1234/

If not, the port used by the server is 8080

You're good to go!!!!

##Extra step : Deploy the app to the staging and the Production Environments

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
heroku create shareat123-prod
heroku buildpacks:set heroku/python --app shareat123-prod
heroku buildpacks:add --index 2 heroku/nodejs --app shareat123-prod
```
The following command set the environment variable so that we know that we are
in the staging environment
```
heroku config:set APP_SETTINGS=ProductionConfig --app shareat123-prod
```

###Deploy the app

From your project directory
To deploy the app to the staging environment:
```
git remote add stage git@heroku.com:shareat123-stage.git
git push stage DevKev:master
```
Your app will be available at https://shareat123-stage.herokuapp.com


To deploy the app to the production environment
```
git remote add prod git@heroku.com:shareat123-prod.git
git push prod master
```
Your app will be available at https://shareat123-prod.herokuapp.com

##Development Workflow :

###Git repository and branches :
- Master : La dernière version stable du code (le code aura été testé sur l’environnement de staging).
- Prod : Le code déployé dans l’environnement de production
- DevKev :  Branche de dev de Kevin. Il ne fusionnera cette branche avec le Master qu’après avoir tester le code sur l’environnement de staging.
- DevDim :  Branche de dev de Dimitri. Il ne fusionnera cette branche avec le Master qu’après avoir tester le code sur l’environnement de staging.
### Development and commit workflow :

-	Je développe une fonctionnalité sur ma branche DevKev
-	Une fois qu’elle marche je la teste sur l’environnement de staging
```
git push stage DevKev:master
```
-	Je mets à jour ma branche avec le master et je gère les éventuels conflits
```
git merge master
```
-	Enfin je fusionne mon travaille avec le master
```
git checkout master
git merge DevKev
```
Et je le partage
```
git push origin master
```

Je peux partager ma branche avec le cloud à n'importe quel moment:
```
git pull origin NomBranch
```

## Directory Layout

```
app/                    --> all of the source files for the application
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
karma.conf.js         --> config file for running unit tests with Karma
.gitignore            --> Files to ignore in git
bower.json            --> bower dependencies
package.json            --> NPM dependencies
Procfile              --> File needed for heroku
Provision.sh          --> File to provision the vagrant VM
requirements.txt      --> File to declare Python dependencies
Vagrantfile           --> File to configure the vagrant VM
```

## Testing

There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

### Running Unit Tests For the Back-End
The tests use python unittest

Enter the following command in your project directory on the guest machine
```
python test/backend_tests/test.py
```
For now, the test can only be executed in the development environment

### Running Unit Tests For the Front-End

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


### End to end testing (Not used Yet)

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


## Updating Angular

Previously we recommended that you merge in changes to angular-seed into your own fork of the project.
Now that the angular framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Loading Angular Asynchronously

The angular-seed project supports loading the framework and application scripts asynchronously.  The
special `index-async.html` is designed to support this style of loading.  For it to work you must
inject a piece of Angular JavaScript into the HTML page.  The project has a predefined script to help
do this.

```
npm run update-index-async
```

This will copy the contents of the `angular-loader.js` library file into the `index-async.html` page.
You can run this every time you update the version of Angular that you are using.


## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

This really depends on how complex your app is and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else should be omitted.

Angular apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere they can be accessed by browsers.

If your Angular app is talking to the backend server via xhr or other means, you need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and webserver(s).


## Continuous Integration

### Travis CI

[Travis CI][travis] is a continuous integration service, which can monitor GitHub for new commits
to your repository and execute scripts such as building the app or running tests. The angular-seed
project contains a Travis configuration file, `.travis.yml`, which will cause Travis to run your
tests when you push to GitHub.

You will need to enable the integration between Travis and GitHub. See the Travis website for more
instruction on how to do this.

### CloudBees

CloudBees have provided a CI/deployment setup:

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/angular-js-clickstart/master/clickstart.json">
<img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>

If you run this, you will get a cloned version of this repo to start working on in a private git repo,
along with a CI service (in Jenkins) hosted that will run unit and end to end tests in both Firefox and Chrome.


## Contact

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
