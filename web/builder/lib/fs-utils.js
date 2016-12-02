import fs from 'fs';
import glob from 'glob';
import libpath from 'path';

const mkdirp = (path) => {
    const dirs = libpath.normalize(path).split('/');
    let current = '';
    for (const dir of dirs) {
        current = libpath.join(current, dir);
        if (!fs.existsSync(current)) {
            fs.mkdirSync(current);
        }
    }
};

const copyFile = (src, dst, mkdir = false) => {
    if (mkdir) {
        mkdirp(libpath.dirname(dst));
    }
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
};

const copyFolder = (srcFolder, dstFolder) => {
    srcFolder = libpath.normalize(`${srcFolder}/`);
    dstFolder = libpath.normalize(`${dstFolder}/`);

    const pattern = libpath.join(srcFolder, '**/*');
    const matchFiles = [];
    const matchFolders = [];
    for (const src of glob.sync(pattern, {mark: true})) {
        const dst = src.replace(srcFolder, dstFolder);
        if (src.endsWith('/')) {
            matchFolders.push(dst);
        } else {
            matchFiles.push([src, dst]);
        }
    }

    mkdirp(dstFolder);
    for (const dst of matchFolders) {
        mkdirp(dst);
    }
    for (const [src, dst] of matchFiles) {
        copyFile(src, dst);
    }
};

export default {mkdirp, copyFile, copyFolder};
