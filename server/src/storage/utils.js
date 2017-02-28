import libpath from 'path';

const resolveHome = (path) => {
    if (path[0] === '~') {
        return libpath.join(process.env.HOME, path.slice(1));
    }
    return path;
};

const resolvePath = (path) => {
    path = resolveHome(path);
    path = libpath.resolve(path);
    return path + libpath.sep;
};

export default {resolveHome, resolvePath};
