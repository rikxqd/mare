import net from 'net';
import uuid from 'node-uuid';
import EventEmitter from 'events';
import {VirtualWebSocket} from '../core/virtual-websocket';

export class BackendServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = null;
    }

    start() {
        this.server = net.createServer();
        this.server.listen(this.config.port, this.config.host);
        this.server.on('connection', this.onServerConnection);
    }

    onServerConnection = (socket) => {
        const ws = new VirtualWebSocket(socket);
        ws.id = `backend:${uuid.v4()}`;
        ws.once('handshake', () => {
            this.emit('connection', ws);
        });
    }

}
