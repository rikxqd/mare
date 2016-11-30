const registry = {

    'Log.enable': async (req) => {
        const resp = {id: req.id, result: {}};
        return resp;
    },

    'Page.getResourceTree': async (req) => {
        const resp = {
            id: req.id,
            result: {
                frameTree: {
                    frame: {
                        id: '22117.1',
                        loaderId: '22117.2',
                        mimeType: 'application/json',
                        securityOrigin: 'http://httpbin.org',
                        url: 'http://httpbin.org/ip',
                    },
                    resources: [],
                },
            },
        };
        return resp;
    },


};

const handleMethod = async (req) => {
    const handler = registry[req.method];
    if (!handler) {
        return {id: req.id, result: {}};
    }

    const resp = await handler(req);
    resp.id = req.id;
    return resp;
};

export {handleMethod};
