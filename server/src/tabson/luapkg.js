import libpath from 'path';

const posixify = (source) => {
    return source.replace(/^@/, '')
        .replace(/[\\/]+/g, '/')
        .replace(/^\.\//, '');
};

const abspath = (relative, path) => {
    if (relative.startsWith('/')) {
        return libpath.posix.resolve(relative, path);
    } else {
        return libpath.win32.resolve(relative, path);
    }
};

const luapkg = {

    sourceToUrl: (source) => {
        let path = posixify(source);
        let domain;
        if (libpath.win32.isAbsolute(path)) {
            domain = 'root';
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
        } else {
            domain = 'project';
        }
        const url = `http://${domain}/${path}`;
        return url;
    },

    sourceToFile: (source, relative) => {
        const path = posixify(source);
        if (libpath.win32.isAbsolute(path)) {
            return path;
        } else {
            return abspath(relative, path);
        }
    },

    urlToFile: (url, relative) => {
        let path;
        if (url.startsWith('http://root/')) {
            path = url.replace('http://root/', '');
            if ((!path.startsWith('/')) && (!libpath.win32.isAbsolute(path))) {
                path = '/' + path;
            }
            return path;
        }
        path = url.replace('http://project/', '');
        return abspath(relative, path);
    },

};

export default luapkg;
