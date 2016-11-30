import ControlServer from './control-server';
import DevToolsServer from './devtools-server';
import LuaDebugServer from './luadebug-server';
import {pushEvent} from './event';
import {handleMethod} from './method';

export default class Bridge {

    constructor(config) {
        this.config = config;

        this.controlServer = new ControlServer(this.config);
        this.devtoolsServer = new DevToolsServer({host: this.config.host});
        this.luadebugServer = new LuaDebugServer(this.config.luadebug);

        this.controlServer.on('get-websocket', (callback) => {
            const result1 = Object.keys(this.devtoolsServer.websocketItems);
            const result2 = Object.keys(this.luadebugServer.socketItems);
            callback({result1, result2});
        });
        this.devtoolsServer.on(
            'method-request', this.onDevToolsServerMethodRequest);
        this.luadebugServer.on(
            'command-request', this.onLuaDebugServerCommandRequest);
    }

    start() {
        this.controlServer.start();
        this.devtoolsServer.start(this.controlServer.server);
        this.luadebugServer.start();
        console.info('bridge started');
    }

    onDevToolsServerMethodRequest = async ({wsid, request}) => {
        const resp = await handleMethod(request);
        this.devtoolsServer.responseMethod(wsid, resp);
    }

    onLuaDebugServerCommandRequest = async ({message}) => {
        const wsid = Object.keys(this.devtoolsServer.websocketItems)[0];
        const event = await pushEvent.consoleLog(message);
        this.devtoolsServer.pushEvent(wsid, event);
    };



}
