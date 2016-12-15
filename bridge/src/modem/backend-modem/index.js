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
        if (msg.method === 'console') {
            this.consoleLogging(msg.params, store);
        }
    }

    consoleLogging = async (data, store) => {
        const resp = {
            method: 'Log.entryAdded',
            params: {
                entry: {
                    source: 'abcd',
                    level: 'log',
                    text: JSON.stringify(data, null, 4),
                    timestamp: new Date().getTime(),
                },
            },
        };
        store.eventAppendOne(resp);
        this.sendFrontend(resp);
    }

}
