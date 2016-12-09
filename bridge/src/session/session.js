import EventEmitter from 'events';
import {DummyWebSocket} from './../core/dummy-websocket';
import {Adapter} from './adapter';

const mktime = () => new Date().getTime();

export class Session extends EventEmitter {

    constructor(id, {title, expire, store, createSide}) {
        super();
        this.id = id;
        this.title = title || 'untitled';
        this.expire = expire;
        this.store = store;
        this.createSide = createSide;
        this.createTime = mktime();
        this.isFrontendConnected = false;
        this.isBackendConnected = false;
        this.frontendConnectionTime = -1;
        this.backendConnectionTime = -1;
        this.logs = [];
        this.initAdapter();
    }

    initAdapter() {
        const fews = DummyWebSocket.createByType(this.id, 'frontend');
        const bews = DummyWebSocket.createByType(this.id, 'backend');
        this.adapter = new Adapter(fews, bews, this.store);
        this.adapter.on('close', this.onAdapterClose);
    }

    setTitle(title) {
        if (title !== undefined) {
            const before = this.title;
            this.title = String(title);
            this.addLog('change-title', {before, after: title});
        }
    }

    setExpire(expire) {
        this.expire = expire;
        clearTimeout(this.expireHandler);
        this.expireHandler = setTimeout(this.checkExpire, expire * 1000);
    }

    frontendConnect(ws) {
        const now = mktime();
        this.adapter.updateFrontend(ws);
        this.isFrontendConnected = true;
        this.frontendConnectionTime = now;
        this.addLog('frontend-connect', {
            remoteHost: ws.socket.remoteAddress,
            remotePort: ws.socket.remotePort,
            sessionArgs: ws.location.query,
        }, now);
    }

    backendConnect(ws) {
        const now = mktime();
        this.adapter.updateBackend(ws);
        this.isBackendConnected = true;
        this.backendConnectionTime = now;
        this.addLog('backend-connect', {
            remoteHost: ws.socket.remoteAddress,
            remotePort: ws.socket.remotePort,
            sessionArgs: ws.location.query,
        }, now);
    }

    onAdapterClose = (whichSide) => {
        const now = mktime();
        const ws = DummyWebSocket.createByType(this.id, whichSide);

        if (whichSide === 'frontend') {
            this.isFrontendConnected = false;
            this.frontendConnectionTime = now;
            this.adapter.updateFrontend(ws);
        }
        if (whichSide === 'backend') {
            this.isBackendConnected = false;
            this.backendConnectionTime = now;
            this.adapter.updateBackend(ws);
        }
        this.addLog(`${whichSide}-disconnect`, {}, now);

        if (!this.isActiviting()) {
            clearTimeout(this.expireHandler);
            const delay = this.expire * 1000;
            this.expireHandler = setTimeout(this.checkExpire, delay);
        }
    }

    isActiviting() {
        return this.isFrontendConnected || this.isBackendConnected;
    }

    checkExpire = () => {
        if (this.expireAfterSeconds() === 0) {
            this.emit('expired', this);
        }
    }

    expireAfterSeconds() {
        if (this.expire === 0 || this.isActiviting()) {
            return -1;
        }
        const now = mktime();
        const latest = Math.max(this.frontendConnectionTime,
                                this.backendConnectionTime);
        let seconds = latest + this.expire * 1000 - now;
        if (seconds < 0) {
            seconds = 0;
        }
        return Math.round(seconds / 1000);
    }

    addLog(tag, content, time) {
        time = time || mktime();
        this.logs.push({tag, content, time});
        // TODO 写到 store 里
    }

    destroy() {
        this.adapter.destroy();
        // TODO 清空 store
    }

    getJSON() {
        const {fews, bews} = this.adapter;
        return {
            id: this.id,
            title: this.title,
            expire: this.expire,
            expireAfterSeconds: this.expireAfterSeconds(),
            createSide: this.createSide,
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
