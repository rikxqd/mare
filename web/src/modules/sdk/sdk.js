import fetcher from './fetcher';

class Sdk {

    constructor() {
        console.log('hello world');
    }

    getEcho = async () => {
        const resp = await fetcher.get('/get');
        return resp;
    }

}

export {Sdk};
