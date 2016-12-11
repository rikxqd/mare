import EventEmitter from 'events';
import WebSocket from 'ws';
import wsUtils from './ws-utils';

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
        ws.id = wsUtils.id('frontend');
        ws.location = wsUtils.location(ws);
        ws.socket = ws._socket;
        this.emit('connection', ws);
    }

}
