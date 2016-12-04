import fetcher from './fetcher';

class Sdk {

    constructor() {
        console.log('hello world');
    }

    getEcho = async (args) => {
        const resp = await fetcher.post('/echo', args);
        return resp;
    }

    getSessions = async () => {
        const resp = await fetcher.get('/json');
        return resp;
    }

}

export {Sdk};
