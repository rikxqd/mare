import bodyParser from 'body-parser';
import express from 'express';

const app = express();
app.set('json spaces', 4);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/echo', (req, resp) => {
    console.log(req);
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

app.use('/json/version', (req, resp) => {
    const result = {
        'Browser': 'Lua Debugger/1.0.0',
        'Protocol-Version': '1.2',
    };
    resp.json(result);
});

app.use('/json', (req, resp) => {
    const bridge = req.bridge;
    const {host, port} = bridge.config.frontend;
    const faviconUrl = 'https://nodejs.org/static/favicon.ico';
    const devtoolsTpl = 'chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true';

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
