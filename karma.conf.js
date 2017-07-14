module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'app/static/bower_components/angular/angular.js',
      'app/static/bower_components/angular-route/angular-route.js',
      'app/static/bower_components/angular-mocks/angular-mocks.js',
      'app/static/components/**/*.js',
      'app/static/view*/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
