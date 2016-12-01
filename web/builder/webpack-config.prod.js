import autoprefixer from 'autoprefixer';
import libpath from 'path';
import webpack from 'webpack';

export default {

    debug: false,
    profile: false,
    devtool: null,

    entry: {
        app: [
            './src/modules/app.js',
        ],
        vendor: [
            'babel-polyfill',
            'immutable',
            'react-dom',
        ],
    },

    output: {
        path: libpath.resolve('./dist/scripts/'),
        filename: '[name].js',
        publicPath: '/scripts/',
    },

    resolve: {
        root: [
            libpath.resolve('./src/modules/'),
        ],
        alias: {
            externals: libpath.resolve('./src/externals/'),
        },
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    ],

    module: {

        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    presets: ['latest', 'stage-0', 'react'],
                    compact: false,
                },
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.html$/,
                loader: 'html',
            },
            {
                test: /\.svg$/,
                loader: 'url',
            },
            {
                test: /\.scss$/,
                loaders: [
                    'style',
                    'css',
                    'postcss',
                    'sass',
                ],
            },
        ],

    },

    sassLoader: {
        errLogToConsole: true,
        outputStyle: 'compressed',
        includePaths: [
            libpath.resolve('./src/modules/'),
        ],
    },

    postcss() {
        return [autoprefixer];
    },

    node: {
        fs: 'empty',
    },

};
