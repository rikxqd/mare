import EventEmitter from 'events';
import net from 'net';
import wsUtils from './ws-utils';
import {PuppetWebSocket} from './puppet-websocket';

export class BackendServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = null;
    }

    start = async () => {
        this.server = net.createServer();
        this.server.listen(this.config.port, this.config.host);
        this.server.on('connection', this.onServerConnection);
    }

    onServerConnection = (socket) => {
        const ws = new PuppetWebSocket(socket);
        ws.id = wsUtils.id('backend');
        ws.once('handshake', () => {
            ws.location = wsUtils.location(ws);
            this.emit('connection', ws);
        });
    }

}
