import EventEmitter from 'events';
import {Session} from './session';

export class SessionManager extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.sessions = {};
        this.storage = null;
    }

    start = async (storage) => {
        this.storage = storage;
        await this.restoreFromStorage();
    }

    restoreFromStorage = async () => {
        const storage = this.storage;
        const sessionStore = storage.getSessionStore();
        const docs = await sessionStore.get();

        const expired = [];
        const fresh = [];
        for (const doc of docs) {
            const session = new Session(doc.id);
            Object.assign(session, doc);
            session.isFrontendConnected = false;
            session.isBackendConnected = false;
            if (session.expireAfterSeconds() === 0) {
                expired.push(session);
            } else {
                fresh.push(session);
            }
        }

        for (const session of expired) {
            const dataStore = storage.getSessionDataStore(session.id);
            console.info('clean-expired-session', session.id);
            await Promise.all([
                dataStore.drop(),
                sessionStore.remove(session.id),
            ]);
            dataStore.destroy();
        }

        for (const session of fresh) {
            session.initialize(this.storage);
            session.on('expire', this.onSessionExpire);
            session.expireCountdown();
            this.sessions[session.id] = session;
        }
    }

    parseExpire(value) {
        const num = parseInt(value);
        if (isNaN(num)) {
            return this.config.expire || 0;
        }
        return num < 0 ? -1 : num;
    }

    addSession(id, initProps) {
        const session = new Session(id);
        Object.assign(session, initProps);
        session.initialize(this.storage);
        session.on('expire', this.onSessionExpire);
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

    attachFrontend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const query = ws.location.query;
            const title = query.initTitle || 'Create By Frontend';
            const expire = this.parseExpire(query.initExpire);
            const creator = 'frontend';
            session = this.addSession(id, {title, expire, creator});
        }
        session.attachFrontend(ws);
    }

    attachBackend(ws) {
        const id = ws.location.pathname.replace('/session/', '');
        let session = this.sessions[id];
        if (!session) {
            const query = ws.location.query;
            const title = query.initTitle || 'Create By Backend';
            const expire = this.parseExpire(query.initExpire);
            const creator = 'backend';
            session = this.addSession(id, {title, expire, creator});
        }
        session.attachBackend(ws);
    }

    saveSessionToStorage(id) {
        const session = this.sessions[id];
        if (session) {
            session.saveToStorage();
        }
    }

    onSessionExpire = (id) => {
        this.removeSession(id);
    }

}
