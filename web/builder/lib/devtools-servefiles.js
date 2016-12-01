import libpath from 'path';

const root = libpath.resolve('./node_modules/chrome-devtools-servefiles/');
const filenames = [
    '/InspectorBackendCommands.js',
    '/SupportedCSSProperties.js',
];

export default (version) => (req, resp, next) => {
    if (!filenames.includes(req.url)) {
        next();
        return;
    }
    const path = `${root}/${version}${req.url}`;
    resp.sendFile(path, (err) => {
        if (err) {
            console.error(err);
            resp.status(err.status).end();
        }
    });
};
