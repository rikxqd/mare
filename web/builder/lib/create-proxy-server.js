import httpProxy from 'http-proxy';

export default (url, respFunc) => {
    const server = httpProxy.createProxyServer({
        changeOrigin: true,
        target: url,
    });
    server.on('error', (err, req, resp) => {
        resp.writeHead(502);
        resp.end(err.toString());
    });
    server.on('proxyRes', respFunc);
    return {
        web: (req, resp) => server.web(req, resp),
        ws: (req, socket, head) => server.ws(req, socket, head),
    };
};
