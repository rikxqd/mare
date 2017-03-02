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

const test = () => {
    const tests = [
        '@aaa/bbb/ccc',
        '@./aaa/bbb/ccc',
        '@/aaa/bbb/ccc',
        '@aaa\\bbb\\ccc',
        '@.\\aaa\\bbb\\ccc',
        '@C:\\aaa\\bbb\\ccc',
        '@C:\\aaa/bbb\\ccc/ddd',
    ];
    const r1 = '/home/mare/mare';
    const r2 = 'E:/mare/mare';

    for (const source of tests) {
        const url = luapkg.sourceToUrl(source);
        const path1 = luapkg.sourceToFile(source, r1);
        const path2 = luapkg.urlToFile(url, r1);
        console.log(source, url, path1, path2, path1 === path2);
    }

    console.log('--');

    for (const source of tests) {
        const url = luapkg.sourceToUrl(source);
        const path1 = luapkg.sourceToFile(source, r2);
        const path2 = luapkg.urlToFile(url, r2);
        console.log(source, url, path1, path2, path1 === path2);
    }
};

//test();

export default luapkg;
