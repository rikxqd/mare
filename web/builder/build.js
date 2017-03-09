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
        fsUtils.mkdirp('./dist/');

        fsUtils.copyFile(
            './src/webroot/index.html',
            './dist/index.html');
        fsUtils.copyFolder(
            './bower_components/mare-devtools-frontend/front_end/',
            './dist/devtools');

        fsUtils.mkdirp('./dist/react-mdl/extra/css/');
        fsUtils.copyFile(
            './node_modules/react-mdl/extra/material.css',
            './dist/react-mdl/extra/material.css');
        fsUtils.copyFile(
            './node_modules/react-mdl/extra/css/material.blue-amber.min.css',
            './dist/react-mdl/extra/css/material.blue-amber.min.css');
        fsUtils.copyFile(
            './node_modules/react-mdl/extra/material.js',
            './dist/react-mdl/extra/material.js');

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
