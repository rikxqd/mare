import EventEmitter from 'events';

export class BackendModem extends EventEmitter {

    constructor() {
        super();
    }

    sendFrontend(value) {
        this.emit('send-frontend', value);
    }

    sendBackend(value) {
        this.emit('send-backend', value);
    }

    deliver = async (msg, store) => {
        // TODO 暂时全输出控制台
        this.consoleLogging(msg, store);
    }

    consoleLogging = async (data, store) => {
        const resp = {
            method: 'Log.entryAdded',
            params: {
                entry: {
                    source: 'abcd',
                    level: 'log',
                    text: data,
                    timestamp: new Date().getTime(),
                },
            },
        };
        store.eventAppendOne(resp);
        this.sendFrontend(resp);
    }

    contextCreated = async (data) => {
        const resp = {
            method: 'Runtime.executionContextCreated',
            params: {
                context: {
                    id: 100,
                    origin: 'http://localhost:8000',
                    name: data.remoteAddress,
                    auxData: {
                        isDefault: true,
                        frameId: '22117.1',
                    },
                },
            },
        };
        this.sendFrontend(resp);
    }

}
