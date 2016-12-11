import http from 'http';
import {Storage} from './storage/storage';
import {BackendServer} from './server/backend-server';
import {FrontendServer} from './server/frontend-server';
import {SessionManager} from './session/session-manager';

export class Bridge {

    constructor(config) {
        this.config = config;
        this.st = new Storage(config.storage);
        this.sm = new SessionManager(config.session);
        this.fes = new FrontendServer(config.frontend);
        this.bes = new BackendServer(config.backend);
        this.webapp = null;
    }

    start = async () => {
        await this.st.start();
        await this.sm.start(this.st);

        await Promise.all([
            this.fes.start(this.webapp),
            this.bes.start(),
        ]);

        this.fes.on('connect', this.onFesConnect);
        this.bes.on('connect', this.onBesConnect);
    }

    mount(middleware) {
        this.webapp = http.createServer((req, resp) => {
            req.bridge = this;
            return middleware(req, resp);
        });
    }

    onFesConnect = (ws) => {
        const url = ws.location.href;
        if (url.startsWith('/session/')) {
            this.sm.attachFrontend(ws);
            return;
        }
        console.warn('unhandled websocket', ws.id, url);
    }

    onBesConnect = (ws) => {
        const url = ws.location.href;
        if (url.startsWith('/session/')) {
            this.sm.attachBackend(ws);
            return;
        }
        console.warn('unhandled websocket', ws.id, url);
    }

}
