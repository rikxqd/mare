import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import EventEmitter from 'events';

export default class ControlServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.app = null;
        this.server = null;
    }

    start() {
        this.initApp();
        this.server = http.createServer(this.app);
        this.server.listen(this.config.port);
    }

    initApp() {
        const app = express();
        app.set('json spaces', 4);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use('/echo', this.routeEcho);
        app.use('/index', this.routeIndex);
        app.use('/json/version', this.routeJsonVersion);
        app.use('/json', this.routeJson);
        this.app = app;
    }

    redirect302 = (path) => (req, resp) => {
        resp.redirect(path);
    }

    routeEcho = (req, resp) => {
        console.log(req);
        const result =  {
            body: req.body,
            url: req.url,
        };
        resp.json(result);
    }

    routeIndex = (req, resp) => {
        this.emit('get-summary', (sessions) => {
            console.log(sessions);
            resp.end('todo');
        });
    }

    routeJson = (req, resp) => {
        const {host, port} = this.config;
        const faviconUrl = 'https://nodejs.org/static/favicon.ico';
        const devtoolsTpl = 'chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true';

        this.emit('get-summary', (sessions) => {
            const items = [];
            for (const session of sessions) {
                const websocketUrl = `${host}:${port}/sessions/${session.id}`;
                const webSocketDebuggerUrl = `ws://${websocketUrl}`;
                const devtoolsFrontendUrl = `${devtoolsTpl}&ws=${websocketUrl}`;

                const item = {
                    description: session.desc,
                    faviconUrl: faviconUrl,
                    id: session.id,
                    title: 'Lua Debugger',
                    type: 'node',
                    url: 'file://',
                };
                if (!session.frontedAttached) {
                    item.webSocketDebuggerUrl = webSocketDebuggerUrl;
                    item.devtoolsFrontendUrl = devtoolsFrontendUrl;
                }
                items.push(item);
            }
            resp.json(items);
        });
    }

    routeJsonVersion = (req, resp) => {
        const result = {
            'Browser': 'Lua Debugger/1.0.0',
            'Protocol-Version': '1.2',
        };
        resp.json(result);
    }

}
