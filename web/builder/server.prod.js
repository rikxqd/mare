import compression from 'compression';
import express from 'express';
import http from 'http';
import libpath from 'path';
import liburl from 'url';
import createProxyServer from './lib/create-proxy-server';
import historyApiFallback from './lib/history-api-fallback';
import stripCookieDomain from './lib/strip-cookie-domain';
import bc from './build-config';

const proxy = createProxyServer(bc.bridgeServerUrl, stripCookieDomain);
const app = express();
const httpServer = http.createServer(app);

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
            '../../mare-devtools-frontend/front_end/',
        ],
    ];
    const option = {fallthrough: false};
    for (const [url, path] of items) {
        app.use(url, express.static(path, option));
    }
}

// root
{
    app.use(compression());
    const root = './dist/';
    const index = 'index.html';
    const option = {index, fallthrough: true};
    const fallback = libpath.resolve(root, index);
    app.use(express.static(root, option));
    app.use(historyApiFallback(fallback));
}

// startup
const address = liburl.parse(bc.releaseListen);
console.info(`服务器地址：http://${address.host}/\n`);
httpServer.listen(address.port, address.hostname, (error) => {
    if (error) {
        console.error(error);
    }
});
