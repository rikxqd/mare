import EventEmitter from 'events';
import {Session} from './session';

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

    parseExpire(value) {
        const globalValue = this.config.expire || 0;
        return parseInt(value) || globalValue;
    }

    addSession(id, creator, props) {
        const session = new Session(id, creator, this.database);
        session.on('expired', this.onSessionExpired);
        Object.assign(session, props);
        this.sessions[id] = session;
        return session;
    }

    removeSession(id) {
        console.info('remove-session', id);
        const session = this.sessions[id];
        if (session) {
            session.cleanup();
            session.destroy();
            delete this.sessions[id];
        }
    }

    existSession(id) {
        return this.sessions[id] !== undefined;
    }

    getSession(id) {
        return this.sessions[id] || null;
    }

    getSessions() {
        return Object.values(this.sessions);
    }

    onSessionExpired = (session) => {
        this.removeSession(session.id);
        // TODO WebSocket 推送通知
    }

    addFrontend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const query = ws.location.query;
            const title = query.initTitle || 'Create By Frontend';
            const expire = this.parseExpire(query.initExpire);
            const creator = 'frontend';
            session = this.addSession(id, creator, {title, expire});
        }
        session.frontendConnect(ws);
    }

    addBackend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const query = ws.location.query;
            const title = query.initTitle || 'Create By Backend';
            const expire = this.parseExpire(query.initExpire);
            const creator = 'backend';
            session = this.addSession(id, creator, {title, expire});
        }
        session.backendConnect(ws);
    }

}
