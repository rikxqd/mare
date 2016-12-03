import http from 'http';
import {BackendServer} from './server/backend-server';
import {FrontendServer} from './server/frontend-server';
import {SessionManager} from './session/session-manager';

export class Bridge {

    constructor(config) {
        this.config = config;
        this.fes = new FrontendServer(config.frontend);
        this.bes = new BackendServer(config.backend);
        this.sm = new SessionManager(config.session);
    }

    start() {
        const controller = this.config.controller;
        const httpServer = http.createServer((req, resp) => {
            req.bridge = this;
            return controller(req, resp);
        });
        this.fes.start(httpServer);
        this.bes.start();

        this.initListeners();
    }

    initListeners() {
        this.fes.on('connection', this.onFesConnection);
        this.bes.on('connection', this.onBesConnection);
    }

    onFesConnection = (ws) => {
        const url = ws.location.href;
        if (url.startsWith('/session/')) {
            this.sm.addFrontend(ws);
            return;
        }
        console.warn('unhandled websocket', ws.id, url);
    }

    onBesConnection = (ws) => {
        const url = ws.location.href;
        if (url.startsWith('/session/')) {
            this.sm.addBackend(ws);
            return;
        }
        console.warn('unhandled websocket', ws.id, url);
    }

}
