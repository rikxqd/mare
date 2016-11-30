import http from 'http';
import express from 'express';
import httpProxy from 'http-proxy';
import libpath from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import historyApiFallback from './lib/history-api-fallback';
import stripCookieDomain from './lib/strip-cookie-domain';
import webpackConfig from './webpack-config.dev';
import bc from './build-config';

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
    const proxy = httpProxy.createProxyServer({
        changeOrigin: true,
        target: bc.apiUrl,
    });
    proxy.on('error', (err, req, resp) => {
        resp.writeHead(502);
        resp.end(err.toString());
    });
    proxy.on('proxyRes', stripCookieDomain);
    const apiServer = (req, resp) => proxy.web(req, resp);
    app.use('/api/', apiServer);

    httpServer.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head);
    });
}

// static
{
    const items = [
        ['/node_modules/', './node_modules/'],
        ['/bower_components/', './bower_components/'],
        ['/devtools/', './node_modules/chrome-devtools-frontend/front_end/'],
    ];
    for (const [url, path] of items) {
        app.use(url, express.static(path, {fallthrough: false}));
    }
}

// root
{
    const root = './src/webroot/';
    const index = 'index.dev.html';
    const fallback = libpath.resolve(root, index);
    app.use(express.static(root, {index}));
    app.use(historyApiFallback(fallback));
}

// startup
const port = /:([0-9]+)/.exec(bc.httpUrl)[1];
httpServer.listen(port, (error) => {
    if (error) {
        console.error(error);
    }
});
