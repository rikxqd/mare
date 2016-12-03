import liburl from 'url';
import uuid from 'node-uuid';
import EventEmitter from 'events';
import {MockWebSocket} from './../core/mock-websocket';
import {SessionAdapter} from './session-adapter';

const getStore = () => {
    return {};
};

const createMockWebSocket = (id, type) => {
    const url = `${id}?isMock=true`;
    const ws = new MockWebSocket(url);
    ws.id = `${type}:${uuid.v4()}`;
    ws.location = liburl.parse(ws.upgradeReq.url, true);
    return ws;
};

export class SessionManager extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.sessions = {};
    }

    addFrontend(fews) {
        const id = fews.location.pathname;
        const store = getStore(id);
        let session = this.sessions[id];

        if (session) {
            session.adapter.updateFrontend(fews);
            session.isMockFrontend = false;
            return;
        }

        const bews = createMockWebSocket(id, 'backend');
        const adapter = new SessionAdapter(id, fews, bews, store);
        adapter.on('close', this.onAdapterClose(id));
        session = {
            id,
            adapter,
            isMockFrontend: false,
            isMockBackend: true,
        };
        this.sessions[id] = session;
    }

    addBackend(bews) {
        const id = bews.location.pathname;
        const store = getStore(id);
        let session = this.sessions[id];

        if (session) {
            session.adapter.updateBackend(bews);
            session.isMockBackend = false;
            return;
        }

        const fews = createMockWebSocket(id, 'frontend');
        const adapter = new SessionAdapter(id, fews, bews, store);
        adapter.on('close', this.onAdapterClose(id));
        session = {
            id,
            adapter,
            isMockFrontend: true,
            isMockBackend: false,
        };
        this.sessions[id] = session;
    }

    destroySession(id) {
        const session = this.sessions[id];
        if (session) {
            session.adapter.destroy();
            delete this.sessions[id];
        }
    }

    onAdapterClose = (id) => (whichSide) => {
        const session = this.sessions[id];

        if (whichSide === 'frontend' && session.isMockBackend) {
            this.destroySession(id);
            return;
        }
        if (whichSide === 'backend' && session.isMockFrontend) {
            this.destroySession(id);
            return;
        }

        const ws = createMockWebSocket(id, whichSide);
        if (whichSide === 'frontend') {
            session.adapter.updateFrontend(ws);
            session.isMockFrontend = true;
        } else {
            session.adapter.updateBackend(ws);
            session.isMockBackend = true;
        }
    }

    getSessions() {
        return Object.values(this.sessions);
    }

}
