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

}
