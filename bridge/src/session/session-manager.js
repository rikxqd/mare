import liburl from 'url';
import EventEmitter from 'events';

export class SessionManager extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.sessions = {};
        this.adapters = {};
    }

    addWebsocket(ws, type) {
        const url = ws.upgradeReq.url;
        const urlObj = liburl.parse(url, true);
        const id = urlObj.pathname;
        const session = this.sessions[id];
        if (!session) {
            session = {id};
            this.sessions[id] = session;
        }
        Object.assign(session, {
            [type]: {
                params: urlObj.query,
                websocket: ws,
            },
        });
        this.refreshAdapaters();
    }

    addFrontendWebSocket(ws) {
        this.addWebSocket(ws, 'frontend');
    }

    addBacktendWebSocket(ws) {
        this.addWebSocket(ws, 'backend');
    }

    getSessions() {
        return [];
    }

    refreshAdapaters() {
    }

}
