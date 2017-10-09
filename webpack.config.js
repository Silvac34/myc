var webpack = require('webpack');
const path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
var chunk = {
    name: "vendor",
    filename: "vendor.bundle.js",
};
var isProd = process.env.NODE_ENV === 'production'; //true or false -- undefined jusqu'à présent

var bootstrapEntryPoints = require('./webpack.bootstrap.config.js');
var bootstrapConfig = isProd ? bootstrapEntryPoints.prod : bootstrapEntryPoints.dev;

module.exports = {
    context: __dirname + '/app/static',
    entry: {
        bootstrap: bootstrapConfig,
        app: './app.js',
        //vendor: ['angular', 'angular-ui-bootstrap', '@uirouter/angularjs']/*, 'satellizer', 'angular-animate', 'angular-filter', 'angular-loading-bar', 'angular-easyfb', 'ng-autocomplete', 'ngmap', 'angular-translate'],*/
        vendor: ['angular'],
        angular_bootstrap: ['angular-ui-bootstrap'],
        angular_ui_router: ['@uirouter/angularjs'],
    },//
    //devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname + '/app/static/dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [{
            test: /\.(css|scss)$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader'],
                publicPath: __dirname + '/app/static/dist'
            })
        }, {
            // Bootstrap 3
            test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
            use: 'imports-loader?jQuery=jquery'
        }, {
            test: /\.(ttf|otf|eot|png|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: 'url-loader?limit=100000&name=fonts/[name].[ext]'
        }]
    },
    plugins: [
        new ExtractTextPlugin('/css/app.bundle.css'),
        new webpack.optimize.CommonsChunkPlugin(chunk),
        new CleanWebpackPlugin(['app/static/dist']),
    ]
};