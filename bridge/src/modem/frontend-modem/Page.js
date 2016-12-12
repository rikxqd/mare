const Page = {};

Page.getResourceTree = async () => {
    return {
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
    };
};

export default Page;
