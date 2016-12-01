import fs from 'fs';
import minimist from 'minimist';

const defaultConfig = {
    debugListen: 'http://0.0.0.0:8001/',
    releaseListen: 'http://0.0.0.0:8000/',
    bridgeServerUrl: 'http://0.0.0.0:9223/',
};

const fileConfig = do {
    const file = './builder.json';
    if (fs.existsSync(file)) {
        const text = fs.readFileSync(file, 'utf-8');
        JSON.parse(text);
    } else {
        ({});
    }
};

const cmdConfig = do {
    const args = minimist(process.argv.slice(2), {stopEarly: true});
    delete args._;
    args;
};

const config = Object.assign({}, defaultConfig, fileConfig, cmdConfig);
console.info('当前构建配置');
console.info(JSON.stringify(config, null, 4));
console.info('');
export default config;
