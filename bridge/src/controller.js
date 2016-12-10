import bodyParser from 'body-parser';
import express from 'express';
import libpath from 'path';
import os from 'os';
import packsageJSON from '../package.json';

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
    const frontendConfig = bridge.config.frontend;
    const publicAddress = req.headers.host || `${frontendConfig.host}:${frontendConfig.port}`;

    const devtoolsTpl = 'chrome-devtools://devtools/bundled/inspector.html?experiments=true';
    const faviconUrl = `${req.protocol}://${publicAddress}/favicon.ico`;

    const items = [];
    for (const session of bridge.sm.getSessions()) {
        const websocketUrl = `${publicAddress}/session/${session.id}`;
        const webSocketDebuggerUrl = `ws://${websocketUrl}`;
        const devtoolsFrontendUrl = `${devtoolsTpl}&ws=${websocketUrl}`;

        const item = {
            description: '',
            faviconUrl: faviconUrl,
            id: session.id,
            title: session.title,
            type: 'lua',
            url: `lua://session/${session.id}`,
        };
        if (!session.isFrontendConnected) {
            item.webSocketDebuggerUrl = webSocketDebuggerUrl;
            item.devtoolsFrontendUrl = devtoolsFrontendUrl;
        }
        items.push(item);
    }
    resp.json(items);
});

app.use('/session/', (req, resp) => {
    const bridge = req.bridge;
    const items = [];
    const publicAddress = req.headers.host;
    for (const session of bridge.sm.getSessions()) {
        const item = session.getJSON();
        item.wsPath = `${publicAddress}/session/${session.id}`;
        items.push(item);
    }
    resp.json(items);
});

app.use('/overview', (req, resp) => {
    const bridge = req.bridge;
    const config = bridge.config;

    const system = {
        hostname: os.hostname(),
        nodejs: process.version,
        os: `${os.type()} ${os.release()}`,
        time: new Date().getTime(),
        uptime: os.uptime(),
    };

    const server = {
        version: packsageJSON.version,
        uptime: process.uptime(),
        pid: process.pid,
        frontend: {
            host: config.frontend.host,
            port: config.frontend.port,
        },
        backend: {
            host: config.backend.host,
            port: config.backend.port,
        },
    };

    const session = do {
        const sessions = bridge.sm.getSessions();
        const activiting = sessions.filter((s) => s.isActiviting());
        ({
            total: sessions.length,
            activiting: activiting.length,
        });
    };

    const project = {
        total: 0,
    };

    const info = {system, server, session, project};
    resp.json(info);
});

app.use('/config', (req, resp) => {
    const bridge = req.bridge;
    resp.json(bridge.config);
});

export default app;
