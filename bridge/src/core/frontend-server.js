import EventEmitter from 'events';
import WebSocket from 'ws';
import liburl from 'url';
import uuid from 'node-uuid';

export class FrontendServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = null;
    }

    start = async (httpServer) => {
        this.server = new WebSocket.Server({
            host: this.config.host,
            server: httpServer,
        });
        httpServer.listen(this.config.port, this.config.host);
        this.server.on('connection', this.onServerConnection);
    }

    onServerConnection = (ws) => {
        ws.id = `frontend:${uuid.v4()}`;
        ws.socket = ws._socket;
        const url = ws.upgradeReq.url.replace(/\|/, '&');
        ws.location = liburl.parse(url, true);
        this.emit('connection', ws);
    }

}
