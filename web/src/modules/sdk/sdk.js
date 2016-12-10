import {Postal} from 'externals/postal';
import fetcher from './fetcher';

class Sdk {

    constructor() {
        this.postal = new Postal();
        this.startPollSession();
        console.log('hello world');
    }

    getEcho = async (args) => {
        const resp = await fetcher.get('/echo', args);
        return resp;
    }

    getSessions = async () => {
        const resp = await fetcher.get('/session/');
        return resp;
    }

    getOverview = async () => {
        const resp = await fetcher.get('/overview');
        return resp;
    }

    getConfig = async () => {
        const resp = await fetcher.get('/config');
        return resp;
    }

    on(...args) {
        return this.postal.sub(...args);
    }

    startPollSession() {
        // TODO 换成 websocket
        setInterval(async () => {
            this.postal.pub('session-update', await this.getSessions());
        }, 2000);
    }

}

export {Sdk};
