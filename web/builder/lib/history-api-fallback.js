export default (path) => (req, resp, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) {
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
