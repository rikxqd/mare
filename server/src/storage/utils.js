import libpath from 'path';

const resolveHome = (path) => {
    if (path[0] === '~') {
        return libpath.join(process.env.HOME, path.slice(1));
    }
    return path;
};

const resolveAsPosix = (path) => {
    return path.replace(/\\+/g, '/');
};

const resolvePath = (path) => {
    path = resolveHome(path);
    path = libpath.resolve(path);
    path = resolveAsPosix(path);
    return path;
};

export default {resolveHome, resolveAsPosix, resolvePath};
