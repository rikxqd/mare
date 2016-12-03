import liburl from 'url';
import EventEmitter from 'events';

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

export class VirtualWebSocket extends EventEmitter {

    constructor(socket) {
        super();
        this.socket = socket;
        this.handshaked = false;
        this.chunk = '';
        this.upgradeReq = {};
        this.initListeners();
    }

    initListeners() {
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
        const urlObj = liburl.parse(message, true);
        this.upgradeReq = {
            url: urlObj.href,
        };
        this.handshaked = true;
        this.emit('handshake');
    }

    onSocketData = (data) => {
        const dataString = data.toString();
        this.feed(dataString);
    }

    onSocketClose = () =>  {
        this.emit('close');
    }

    onSocketError = () => {
        this.emit('error');
    }

}
