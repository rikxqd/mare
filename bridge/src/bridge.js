import http from 'http';
import {BackendServer} from './server/backend-server';
import {FrontendServer} from './server/frontend-server';
//import SessionAdapter from './session/session-adapter';
import {SessionManager} from './session/session-manager';
import {pushEvent} from './event';
import {handleMethod} from './method';

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
        const url = ws.upgradeReq.url;
        if (url.startsWith('/session/')) {
            this.sm.addFrontendWebSocket(ws);
            return;
        }
        console.warn('未处理的 websocket', ws.id, url);
    }

    onBesConnection = (ws) => {
        const url = ws.upgradeReq.url;
        if (url.startsWith('/session/')) {
            this.sm.addBackendWebSocket(ws);
            return;
        }
        console.warn('未处理的 websocket', ws.id, url);
    }

    initDevToolsServerEventHandlers() {
        this.ds.on('method-request', async (wsid, request) => {
            const resp = await handleMethod(request);
            this.ds.responseMethod(wsid, resp);
        });
    }

    initLuaDebugServerEventHandlers() {
        this.ls.on('command-request', async ({message}) => {
            const wsid = Object.keys(this.ds.websocketItems)[0];
            const event = await pushEvent.consoleLog(message);
            this.ds.pushEvent(wsid, event);
        });
    }

}
