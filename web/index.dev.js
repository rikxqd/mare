import express from 'express';
import http from 'http';
import libpath from 'path';
import liburl from 'url';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import createProxyServer from './builder/lib/create-proxy-server';
import historyApiFallback from './builder/lib/history-api-fallback';
import stripCookieDomain from './builder/lib/strip-cookie-domain';
import webpackConfig from './builder/webpack-config.dev';
import bc from './builder/build-config';

const proxy = createProxyServer(bc.apiServerUrl, stripCookieDomain);
const app = express();
const httpServer = http.createServer(app);

// webpack
{
    const compiler = webpack(webpackConfig);
    const devServer = webpackDevMiddleware(compiler, {
        noInfo: false,
        publicPath: webpackConfig.output.publicPath,
        stats: {colors: true},
    });
    app.use(devServer);
    app.use(webpackHotMiddleware(compiler));
}

// api
{
    app.use('/api/', proxy.web);
    httpServer.on('upgrade', proxy.ws);
}

// static
{
    const items = [
        [
            '/node_modules/',
            './node_modules/',
        ],
        [
            '/devtools/',
            `${bc.devtoolsFrontend}/front_end`,
        ],
    ];
    const option = {fallthrough: false};
    for (const [url, path] of items) {
        app.use(url, express.static(path, option));
    }
}

// root
{
    const root = './src/webroot/';
    const index = 'index.dev.html';
    const option = {index, fallthrough: true};
    const fallback = libpath.resolve(root, index);
    app.use(express.static(root, option));
    app.use(historyApiFallback(fallback));
}

// startup
const address = liburl.parse(bc.localServerUrl);
console.info(`服务器地址：http://${address.host}/\n`);
httpServer.listen(address.port, address.hostname, (error) => {
    if (error) {
        console.error(error);
    }
});
