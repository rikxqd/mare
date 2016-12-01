export default (proxyResp) => {
    const headers = proxyResp.headers;
    for (const key of Object.keys(headers)) {
        if (key.toLowerCase() !== 'set-cookie') {
            continue;
        }
        const cookies = headers[key];
        for (const [i, cookie] of Object.entries(cookies)) {
            cookies[i] = cookie.replace(/ [Dd]omain=.+?;/, '');
        }
    }
};
