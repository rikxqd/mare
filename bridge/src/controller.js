import bodyParser from 'body-parser';
import express from 'express';
import libpath from 'path';

const app = express();
app.set('json spaces', 4);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/echo', (req, resp) => {
    console.info(req);
    const result =  {
        body: req.body,
        url: req.url,
    };
    resp.json(result);
});

app.use('/index', (req, resp) => {
    const result = {
        x: 1,
        y: 2,
    };
    resp.json(result);
});

app.use('/favicon.ico', (req, resp) => {
    const path = libpath.resolve('./src/assets/favicon.ico');
    resp.sendFile(path, (err) => {
        if (err) {
            console.error(err);
            resp.status(err.status).end();
        }
    });
});

app.use('/json/version', (req, resp) => {
    const path = libpath.resolve('./src/assets/version.json');
    resp.sendFile(path, (err) => {
        if (err) {
            console.error(err);
            resp.status(err.status).end();
        }
    });
});

app.use('/json', (req, resp) => {
    const bridge = req.bridge;
    const {host, port} = bridge.config.frontend;
    const publicAddress = req.headers.host || `${host}:${port}`;
    const faviconUrl = `${req.protocol}://${publicAddress}/favicon.ico`;
    const devtoolsTpl = 'chrome-devtools://devtools/bundled/inspector.html?experiments=true';

    const items = [];
    for (const session of bridge.sm.getSessions()) {
        const websocketUrl = `${host}:${port}${session.id}`;
        const webSocketDebuggerUrl = `ws://${websocketUrl}`;
        const devtoolsFrontendUrl = `${devtoolsTpl}&ws=${websocketUrl}`;

        const item = {
            description: '',
            faviconUrl: faviconUrl,
            id: session.id,
            title: 'Lua Debugger',
            type: 'node',
            url: 'file://',
        };
        if (session.isMockFrontend) {
            item.webSocketDebuggerUrl = webSocketDebuggerUrl;
            item.devtoolsFrontendUrl = devtoolsFrontendUrl;
        }
        items.push(item);
    }
    resp.json(items);
});

export default app;
