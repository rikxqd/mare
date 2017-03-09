export default (path) => (req, resp, next) => {
    const isGet = req.method === 'GET';
    const isHTML = req.headers.accept.startsWith('text/html');
    if (!(isGet && isHTML)) {
        next();
        return;
    }
    resp.sendFile(path, (err) => {
        if (err) {
            console.error(err);
            resp.status(err.status).end();
        }
    });
};
