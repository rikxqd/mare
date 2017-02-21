import fs from 'fs';
import glob from 'glob';

const readFile = (url) => {
    return new Promise((resolve, reject) => {
        fs.readFile(url, 'utf8', (error, data) => {
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
    const pattern = `${project.source}/**/*.lua`;
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
                const path = f.replace(project.source, '');
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

    let abspath;
    if (url.startsWith('http://root/')) {
        abspath = url.replace('http://root/', '/');
    } else {
        abspath = url.replace('http://project/', project.source);
    }

    let content = '';
    try {
        content = await readFile(abspath);
    } catch (e) {
        content = `-- ${e}`;
    }

    return {base64Encoded: false, content};
};

export default Page;
