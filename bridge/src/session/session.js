import EventEmitter from 'events';
import {DummyWebSocket} from './../core/dummy-websocket';
import {Adapter} from './adapter';
import {Store} from './store';

const mktime = () => new Date().getTime();

export class Session extends EventEmitter {

    constructor(id, creator, database) {
        super();
        this.id = id;
        this.creator = creator;
        this.database = database;

        this.title = 'untitle';
        this.expire = -1;
        this.isFrontendConnected = false;
        this.isBackendConnected = false;

        this.createTime = mktime();
        this.frontendConnectionTime = -1;
        this.backendConnectionTime = -1;

        this.initStore();
        this.initLogs();
        this.initAdapter();
    }

    initStore() {
        this.store = new Store(this.id, this.database);
    }

    initLogs() {
        this.logs = [];
        this.store.getLogs().then((logs) => this.logs = logs);
    }

    initAdapter() {
        const fews = DummyWebSocket.fromSessionId(this.id, 'frontend');
        const bews = DummyWebSocket.fromSessionId(this.id, 'backend');
        this.adapter = new Adapter(this.id, fews, bews, this.store);
        this.adapter.on('websocket-close', this.onAdapterWebSocketClose);
    }

    isExpirable() {
        return this.expire >= 0;
    }

    isActiviting() {
        return this.isFrontendConnected || this.isBackendConnected;
    }

    expireAfterSeconds() {
        if (!this.isExpirable() || this.isActiviting()) {
            return -1;
        }

        const now = mktime();
        const latest = Math.max(
            this.frontendConnectionTime, this.backendConnectionTime);
        const seconds = latest + (this.expire * 1000) - now;
        return Math.round(seconds / 1000);
    }

    setTitle(title, log = true) {
        const before = this.title;
        this.title = String(title);
        if (log) {
            this.addLog('change-title', {before, after: title});
        }
    }

    setExpire(expire, log = true) {
        if (expire < 0) {
            expire = -1;
        }
        const before = this.title;
        this.expire = expire;
        if (log) {
            this.addLog('change-expire', {before, after: expire});
        }

        this.expireCountdown();
    }

    frontendConnect(ws) {
        clearTimeout(this.expireTimeout);

        const now = mktime();
        this.adapter.updateFrontend(ws);
        this.isFrontendConnected = true;
        this.frontendConnectionTime = now;
        this.addLog('connect', {
            side: 'frontend',
            remoteHost: ws.socket.remoteAddress,
            remotePort: ws.socket.remotePort,
            sessionArgs: ws.location.query,
        }, now);

        this.adapter.replayFrontendEvents();
    }

    backendConnect(ws) {
        clearTimeout(this.expireTimeout);

        const now = mktime();
        this.adapter.updateBackend(ws);
        this.isBackendConnected = true;
        this.backendConnectionTime = now;
        this.addLog('connect', {
            side: 'backend',
            remoteHost: ws.socket.remoteAddress,
            remotePort: ws.socket.remotePort,
            sessionArgs: ws.location.query,
        }, now);

        // TODO 推送一些配置给后端
    }

    onAdapterWebSocketClose = (side) => {
        const now = mktime();
        const ws = DummyWebSocket.fromSessionId(this.id, side);

        if (side === 'frontend') {
            this.isFrontendConnected = false;
            this.frontendConnectionTime = now;
            this.adapter.updateFrontend(ws);
        }
        if (side === 'backend') {
            this.isBackendConnected = false;
            this.backendConnectionTime = now;
            this.adapter.updateBackend(ws);
        }

        this.addLog('disconnect', {side}, now);
        this.expireCountdown();
    }

    expireCountdown() {
        clearTimeout(this.expireTimeout);
        if (!this.isExpirable() || this.isActiviting()) {
            return;
        }

        this.expireTimeout = setTimeout(() => {
            if (this.expireAfterSeconds() <= 0) {
                this.emit('expired', this);
            }
        }, this.expire  * 1000);
    }

    addLog(tag, content, time) {
        time = time || mktime();
        const log = {tag, content, time};
        this.logs.push(log);
        this.store.appendLog(log);
    }

    cleanup() {
        this.adapter.close();
        this.store.clearEvents();
        this.store.clearLogs();
    }

    destroy() {
        this.adapter.destroy();
        this.store.destroy();
        this.adapter = null;
        this.store = null;
        this.logs = null;
    }

    getJSON() {
        const {fews, bews} = this.adapter;
        return {
            id: this.id,
            title: this.title,
            expire: this.expire,
            expireAfterSeconds: this.expireAfterSeconds(),
            creator: this.creator,
            createTime: this.createTime,
            isActiviting: this.isActiviting(),
            logCount: this.logs.length,
            frontend: {
                isConnected: this.isFrontendConnected,
                connectionTime: this.frontendConnectionTime,
                remoteHost: fews.socket.remoteAddress,
                remotePort: fews.socket.remotePort,
                sessionArgs: fews.location.query,
            },
            backend: {
                isConnected: this.isBackendConnected,
                connectionTime: this.backendConnectionTime,
                remoteHost: bews.socket.remoteAddress,
                remotePort: bews.socket.remotePort,
                sessionArgs: bews.location.query,
            },
        };
    }

}
