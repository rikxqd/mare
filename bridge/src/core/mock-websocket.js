import EventEmitter from 'events';
import WebSocket from 'ws';

export class MockWebSocket extends EventEmitter {

    constructor(url) {
        super();
        this.readyState = WebSocket.OPEN;
        this.upgradeReq = {url};
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        this.removeAllListeners();
    }

    send() {
    }

}
