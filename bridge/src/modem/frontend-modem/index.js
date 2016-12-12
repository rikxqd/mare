import EventEmitter from 'events';
import domains from './domains';

export class FrontendModem extends EventEmitter {

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
        const [domain, prop] = msg.method.split('.');
        let func;
        try {
            func = domains[domain][prop];
        } catch (e) {
            func = null;
        }

        console.log(msg, func);
        let result;
        if (func) {
            result = await func(msg, store);
        }
        if (!result) {
            result = {};
        }

        const resp = {id: msg.id, result};
        this.sendFrontend(resp);
    }


}
