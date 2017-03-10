const compression = require('compression');
const express = require('express');
const http = require('http');
const libpath = require('path');
const liburl = require('url');
const createProxyServer = require('./lib/create-proxy-server').default;
const historyApiFallback = require('./lib/history-api-fallback').default;
const stripCookieDomain = require('./lib/strip-cookie-domain').default;

const apiServerUrl = 'http://127.0.0.1:9223/';
const localServerUrl = 'http://127.0.0.1:8001/';

const app = express();
const httpServer = http.createServer(app);

// api
const proxy = createProxyServer(apiServerUrl, stripCookieDomain);
app.use('/api/', proxy.web);
httpServer.on('upgrade', proxy.ws);

// root
app.use(compression());
const root = `${__dirname}/webroot/`;
const index = 'index.html';
const option = {index, fallthrough: true};
const fallback = libpath.resolve(root, index);
app.use(express.static(root, option));
app.use(historyApiFallback(fallback));

// startup
const address = liburl.parse(localServerUrl);
console.info('当前以产品模式运行');
console.info(`* 服务器地址：http://${address.host}/\n`);
httpServer.listen(address.port, address.hostname, (error) => {
    if (error) {
        console.error(error);
    }
});
