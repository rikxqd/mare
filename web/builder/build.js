import rimraf from 'rimraf';
import webpack from 'webpack';
import fsUtils from './lib/fs-utils';
import webpackConfig from './webpack-config.prod';

const runWebpackBuild = () => {
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            console.info(stats.toString({
                errorDetails: true,
                colors: true,
            }));
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

const copyWebRoot = () => {

    return new Promise((resolve) => {
        fsUtils.copyFolder(
            './src/webroot/',
            './dist/');
        resolve();
    });
};

(async () => {
    try {
        await cleanDistDir();
        await copyWebRoot();
        await runWebpackBuild();
    } catch (e) {
        console.error('构建失败');
        console.error(e);
        return;
    }
    console.info('构建完毕');
})();
