class PushEvent {

    consoleLog = async (data, store) =>{
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
        return resp;
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
        return resp;
    }

}

const pushEvent = new PushEvent();
export {pushEvent};
