import EventEmitter from 'events';
import WebSocket from 'ws';

const getWebSocketId = (ws) => {
    const socket = ws.upgradeReq.socket;
    const {remoteAddress, remotePort} = socket;
    return `${remoteAddress}:${remotePort}`;
};

export default class DevToolsServer extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.server = null;
        this.websocketItems = {};
    }

    start(httpServer) {
        if (httpServer) {
            this.server = new WebSocket.Server({host: this.config.host, server: httpServer});
        } else {
            this.server = new WebSocket.Server(this.config);
        }
        this.server.on('connection', this.onServerConnection);
    }

    onServerConnection = (ws) => {
        const wsid = getWebSocketId(ws);
        const luaDebugSessionKey = ws.upgradeReq.url.slice(1);
        console.log('connection', wsid, ws, luaDebugSessionKey);
        this.websocketItems[wsid] = {websocket: ws};

        ws.on('close', this.onWebSocketClose(ws));
        ws.on('message', this.onWebSocketMessage(ws));
        ws.on('error', this.onWebSocketError(ws));
    }

    onWebSocketClose = (ws) => (code, message) =>  {
        const wsid = getWebSocketId(ws);
        console.log('close', wsid, code, message);
        delete this.websocketItems[wsid];
    }

    onWebSocketMessage = (ws) => (data, flags) => {
        const wsid = getWebSocketId(ws);
        console.log('message', wsid, data, flags.masked);
        const request = JSON.parse(data);
        this.emit('method-request', {wsid, request});
    }

    onWebSocketError = (ws) => (error) => {
        const wsid = getWebSocketId(ws);
        console.log('error', wsid, error);
    }

    responseMethod(wsid, response) {
        const ws = this.websocketItems[wsid].websocket;
        const data = JSON.stringify(response);
        ws.send(data);
    }

    pushEvent(wsid, event) {
        const ws = this.websocketItems[wsid].websocket;
        const data = JSON.stringify(event);
        ws.send(data);
    }

}
