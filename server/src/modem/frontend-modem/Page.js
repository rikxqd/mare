import fs from 'fs';
import glob from 'glob';
import luapkg from '../../tabson/luapkg';

const readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    });
};

const globFiles = (pattern) => {
    return new Promise((resolve, reject) => {
        glob(pattern, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
};

const Page = {};

Page.getResourceTree = async (req, store) => {
    const project = store.project;
    let pattern;
    if (project.chdir) {
        pattern = `${project.source}/${project.chdir}/**/*.lua`;
    } else {
        pattern = `${project.source}/**/*.lua`;
    }
    const files = await globFiles(pattern);
    return {
        frameTree: {
            frame: {
                id: '1',
                loaderId: '1',
                mimeType: 'text/x-lua',
                securityOrigin: 'http://project',
                url: `http://project/${project.main}`,
            },
            resources: files.map((f) => {
                // glob 返回的是正斜杠
                const path = f.replace(project.source + '/', '');
                return {
                    mimeType: 'text/x-lua',
                    type: 'Document',
                    url: `http://project/${path}`,
                };
            }),
        },
    };
};

Page.getResourceContent = async (req, store) => {
    const project = store.project;
    const url = req.params.url;
    const abspath = luapkg.urlToFile(url, project.source);

    let content = '';
    try {
        content = await readFile(abspath);
    } catch (e) {
        content = `-- ${e}`;
    }

    return {base64Encoded: false, content};
};

export default Page;
