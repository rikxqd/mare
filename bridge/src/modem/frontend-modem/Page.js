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
    const pattern = `${project.sourceRoot}/**/*.lua`;
    const files = await globFiles(pattern);
    return {
        frameTree: {
            frame: {
                id: '1',
                loaderId: '1',
                mimeType: 'text/x-lua',
                securityOrigin: 'file://',
                url: `file:///${project.mainFile}`,
            },
            resources: files.map((f) => {
                const path = f.replace(project.sourceRoot, '');
                return {
                    mimeType: 'text/x-lua',
                    type: 'Document',
                    url: `file:///${path}`,
                };
            }),
        },
    };
};

Page.getResourceContent = async (req, store) => {
    const project = store.project;
    const url = req.params.url.replace('file://', project.sourceRoot);
    const content = await readFile(url);
    return {base64Encoded: false, content};
};

export default Page;
