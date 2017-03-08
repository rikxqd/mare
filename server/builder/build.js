import child_process from 'child_process';
import fsUtils from './lib/fs-utils';
import rimraf from 'rimraf';

const runBabelBuild = () => {
    const inputDir = './src';
    const outputDir = './dist/src';
    const cmd = `babel ${inputDir} --out-dir ${outputDir}`;
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                reject();
                return;
            }
            if (error) {
                console.error(stderr);
                reject();
                return;
            }
            console.info(stdout);
            resolve();
        });
    });
};

const cleanDistDir = () => {
    return new Promise((resolve, reject) => {
        const files = './dist/**/*';
        rimraf(files, {}, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

const copyAuxFiles = () => {

    return new Promise((resolve) => {
        fsUtils.mkdirp('./dist/dbdata');
        fsUtils.copyFile(
            './index.js',
            './dist/index.js');
        fsUtils.copyFile(
            './package.json',
            './dist/package.json');
        resolve();
    });
};

(async () => {
    try {
        await cleanDistDir();
        await copyAuxFiles();
        await runBabelBuild();
    } catch (e) {
        console.error('构建失败');
        console.error(e);
        return;
    }
    console.info('构建完毕');
})();
