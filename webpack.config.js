
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const extractCSS = new ExtractTextPlugin('../css/[name].bundle.css');

var plugins = [
    extractCSS
];

if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    plugins.push(
        new webpack.optimize.DedupePlugin()
    );

    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            mangle: true,
            output: {
              comments: false
            },
            compress: {
              warnings: false
            }
        })
    );
}


module.exports = {
    devtool: 'source-map',
    debug: true,
    plugins: plugins,
    context: path.resolve(__dirname, 'src', 'public'),
    entry: {
        home: './js/home',
        theme: './js/theme'
    },
    output: {
        path: path.resolve(__dirname, 'src', 'public', 'js'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            {
                test: /public\/js\/.*\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                // leaflet-omnivore depends on dsv@0.0.3
                // dsv@0.0.3 is deprecated and npm replaces it by d3-dsv
                // d3-dsv depends on fs, which is not available in a web context
                // So... There...
                test: /node_modules\/dsv/,
                loader: 'transform?brfs',
            },
            {
                test: /\.css$/,
                loader: extractCSS.extract(['css'])
            },
            {
                test: /\.less$/,
                loader: extractCSS.extract(['css', 'less'])
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /.*\.svg$/,
                loader: 'raw'
            },
            {
                test: /\.ejs$/,
                loader: 'ejs'
            },
            {
                test: /\.png$/,
                loader: 'file?name=../assets/[name].[ext]'
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file?mimetype=application/font-woff&name=../assets/[name].[ext]"
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file?mimetype=application/font-woff2&name=../assets/[name].[ext]"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file?mimetype=application/octet-stream&name=../assets/[name].[ext]"
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file?mimetype=application/vnd.ms-fontobject&name=../assets/[name].[ext]"
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /img/,
                loader: "file?mimetype=image/svg+xml&name=../assets/[name].[ext]"
            }
        ]
    },
};
