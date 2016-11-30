import net from 'net';
import EventEmitter from 'events';

const getSocketId = (s) => {
    const {remoteAddress, remotePort} = s;
    return `${remoteAddress}:${remotePort}`;
};

class Receiver extends EventEmitter {

    constructor(...args) {
        super(...args);
        this.chunk = '';
    }

    feed(data) {
        const chunks = this.chunk + data;
        const messages = chunks.split('\r\n');

        const length = messages.length;
        if (length === 0) {
            this.chunk = '';
            return;
        }
        if (length === 1) {
            this.chunk = messages[0];
            return;
        }

        this.chunk = messages.splice(-1)[0];
        for (const message of messages) {
            this.emit('message', message);
        }
    }

}

export default class LuaDebugServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = null;
        this.socketItems = {};
    }

    start() {
        this.server = net.createServer();
        this.server.listen(this.config.port, this.config.host);
        this.server.on('connection', this.onServerConnection);
    }

    onServerConnection = (s) => {
        const sid = getSocketId(s);
        console.log('connection', sid, s);
        const receiver = new Receiver();
        this.socketItems[sid] = {socket: s, receiver};

        receiver.on('message', this.onReceiveMessages(s));
        s.on('close', this.onSocketClose(s));
        s.on('data', this.onSocketData(s, receiver));
        s.on('error', this.onSocketError(s));
    }

    onSocketClose = (s) => () =>  {
        const sid = getSocketId(s);
        console.log('close', sid);
        delete this.socketItems[sid];
    }

    onSocketData = (s, receiver) => (data) => {
        const sid = getSocketId(s);
        const dataString = data.toString();
        console.log('data', sid, dataString);
        receiver.feed(dataString);
    }

    onSocketError = (s) => () => {
        const sid = getSocketId(s);
        console.log('error', sid);
    }

    onReceiveMessages = (s) => (message) => {
        const sid = getSocketId(s);
        this.emit('command-request', {sid, message});
    }

}
