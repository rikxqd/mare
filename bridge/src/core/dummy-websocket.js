import EventEmitter from 'events';
import WebSocket from 'ws';
import wsUtils from './ws-utils';

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

    static fromSessionId(sessionId, type) {
        const url = `/session/${sessionId}`;
        const ws = new DummyWebSocket(url);
        ws.id = wsUtils.id(type);
        ws.location = wsUtils.location(ws);
        return ws;
    }

}
