import fs from 'fs';
import glob from 'glob';
import rimraf from 'rimraf';
import webpack from 'webpack';
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
    const copyFile = (src, dst) => {
        fs.createReadStream(src).pipe(fs.createWriteStream(dst));
    };

    return new Promise((resolve) => {
        if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist');
        }

        for (const src of glob.sync('./src/webroot/**/*')) {
            const dst = src.replace('./src/webroot/', './dist/');
            copyFile(src, dst);
        }

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
        return;
    }
    console.info('构建成功');
})();
