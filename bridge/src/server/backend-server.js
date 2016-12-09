import EventEmitter from 'events';
import liburl from 'url';
import net from 'net';
import uuid from 'node-uuid';
import {PuppetWebSocket} from '../core/puppet-websocket';

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
        const ws = new PuppetWebSocket(socket);
        ws.id = `backend:${uuid.v4()}`;
        ws.once('handshake', () => {
            ws.location = liburl.parse(ws.upgradeReq.url, true);
            this.emit('connection', ws);
        });
    }

}
