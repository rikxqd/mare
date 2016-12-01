import autoprefixer from 'autoprefixer';
import libpath from 'path';
import webpack from 'webpack';

export default {

    debug: true,
    profile: false,
    devtool: 'cheap-module-eval-source-map',

    entry: {
        app: [
            'webpack-hot-middleware/client?reload=true',
            './src/modules/app.js',
        ],
        test: [
            'webpack-hot-middleware/client?reload=true',
            './src/modules/test.js',
        ],
    },

    externals: {
        'immutable': 'Immutable',
        'react-dom': 'ReactDOM',
        'react': 'React',
        'react-proxy': 'ReactProxy',
        'redbox-react': 'redbox',
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
        new webpack.HotModuleReplacementPlugin(),
    ],

    module: {

        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                    presets: ['latest', 'stage-0', 'react', 'react-hmre'],
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
                    'css?localIdentName=[name]-[local]-[hash:base64:5]',
                    'postcss',
                    'sass',
                ],
            },
        ],

    },

    sassLoader: {
        errLogToConsole: true,
        outputStyle: 'expanded',
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
