import compression from 'compression';
import express from 'express';
import httpProxy from 'http-proxy';
import libpath from 'path';
import historyApiFallback from './lib/history-api-fallback';
import stripCookieDomain from './lib/strip-cookie-domain';
import bc from './build-config';

const app = express();

// api
{
    const apiProxy = httpProxy.createProxyServer({
        changeOrigin: true,
        target: bc.apiUrl,
    });
    apiProxy.on('error', (err, req, resp) => {
        resp.writeHead(502);
        resp.end(err.toString());
    });
    apiProxy.on('proxyRes', stripCookieDomain);
    app.use('/api/', apiProxy.web);
}

// root
{
    app.use(compression());
    const root = './dist/';
    const index = 'index.html';
    const fallback = libpath.resolve(root, index);
    app.use(express.static(root, {index}));
    app.use(historyApiFallback(fallback));
}

// startup
const port = /:([0-9]+)/.exec(bc.httpUrl)[1];
app.listen(port, function(error) {
    if (error) {
        console.error(error);
    }
});
