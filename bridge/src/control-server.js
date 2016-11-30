import http from 'http';
import express from 'express';
import EventEmitter from 'events';

export default class ControlServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.app = null;
        this.server = null;
    }

    start() {
        this.app = express();
        this.app.use('/hello', (req, resp) => {
            resp.end('hello, world');
        });
        this.app.use('/connected', (req, resp) => {
            this.emit('get-websocket', (result) => {
                const text = JSON.stringify(result, null, 4);
                resp.end(text);
            });
        });

        this.server = http.createServer(this.app);
        this.server.listen(this.config.port);
    }

}
