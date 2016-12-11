import EventEmitter from 'events';
import {Session} from './session';
import {Store} from './store';

export class SessionManager extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.sessions = {};
        this.database = null;
    }

    start = async (database) => {
        this.database = database;
    }

    existSession(id) {
        return this.sessions[id] !== undefined;
    }

    addSession(id, {title, expire, createSide}) {
        title = title || 'untitled';
        expire = do {
            if (expire === undefined || expire === null) {
                this.config.removeExpire;
            } else {
                parseInt(expire);
            }
        };
        createSide = createSide || 'controller';
        const store = new Store(id, this.database);
        const session = new Session(id, {title, expire, store, createSide});
        session.on('expired', this.onSessionExpired);
        this.sessions[id] = session;
        return session;
    }

    addFrontend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const title = ws.location.query.initTitle;
            const expire = ws.location.query.initExpire;
            const createSide = 'frontend';
            session = this.addSession(id, {title, expire, createSide});
        }
        session.frontendConnect(ws);
    }

    addBackend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const title = ws.location.query.initTitle;
            const expire = ws.location.query.initExpire;
            const createSide = 'backend';
            session = this.addSession(id, {title, expire, createSide});
        }
        session.backendConnect(ws);
    }

    destroySession(id) {
        console.info('destroy-session', id);
        const session = this.sessions[id];
        if (session) {
            session.destroy();
            delete this.sessions[id];
        }
    }

    onSessionExpired = (session) => {
        this.destroySession(session.id);
        // TODO WebSocket 推送通知
    }

    getSession(id) {
        return this.sessions[id] || null;
    }

    getSessions() {
        return Object.values(this.sessions);
    }

}
