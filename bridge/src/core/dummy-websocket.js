import EventEmitter from 'events';
import WebSocket from 'ws';
import liburl from 'url';
import uuid from 'node-uuid';

export class DummyWebSocket extends EventEmitter {

    constructor(url) {
        super();
        this.readyState = WebSocket.OPEN;
        this.socket = {
            remoteAddress: null,
            remotePort: null,
        };
        this.upgradeReq = {url};
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        this.removeAllListeners();
    }

    send() {
    }

    static createByType(id, type) {
        const ws = new DummyWebSocket(id);
        ws.id = `${type}:${uuid.v4()}`;
        ws.location = liburl.parse(ws.upgradeReq.url, true);
        return ws;
    }

}
