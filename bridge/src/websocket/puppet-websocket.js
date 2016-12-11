import EventEmitter from 'events';
import WebSocket from 'ws';
import liburl from 'url';

const parseMessages = (data) => {
    let messages = null;
    let chunk = '';

    const parts = data.split('\r\n');
    const length = parts.length;
    if (length === 1) {
        chunk = parts[0];
    } else if (length > 1) {
        chunk = parts.splice(-1)[0];
        messages = parts;
    }
    return {messages, chunk};
};

export class PuppetWebSocket extends EventEmitter {

    constructor(socket) {
        super();
        this.socket = socket;
        this.handshaked = false;
        this.chunk = '';
        this.upgradeReq = null;
        this.readyState = WebSocket.OPEN;
        this.initSocketListeners();
    }

    initSocketListeners() {
        this.socket.on('data', this.onSocketData);
        this.socket.on('close', this.onSocketClose);
        this.socket.on('error', this.onSocketError);
    }

    feed(newData) {
        const data = this.chunk + newData;
        const {messages, chunk} = parseMessages(data);
        this.chunk = chunk;
        if (!this.handshaked) {
            const message = messages.shift();
            this.doHandShake(message);
        }
        for (const message of messages) {
            this.emit('message', message);
        }
    }

    doHandShake(message) {
        const location = liburl.parse(message.trim(), true);
        this.upgradeReq = {
            url: location.href,
        };
        this.handshaked = true;
        this.emit('handshake');
    }

    onSocketData = (data) => {
        const dataString = data.toString();
        this.feed(dataString);
    }

    onSocketClose = (hadError) =>  {
        const code = hadError ? 1001 : 1000;
        this.readyState = WebSocket.CLOSED;
        this.emit('close', code, '');
    }

    onSocketError = (error) => {
        this.emit('error', error);
    }

    close() {
        if (this.readyState === WebSocket.CLOSED) {
            return;
        }
        if (this.socket.destroyed) {
            return;
        }
        this.socket.destroy();
        this.readyState = WebSocket.CLOSED;
    }

    send(data) {
        this.socket.send(data);
    }

}
