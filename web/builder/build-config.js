import fs from 'fs';
import libpath from 'path';
import minimist from 'minimist';

const defaultConfig = {
    apiServerUrl: 'http://127.0.0.1:9223/',
    localServerUrl: 'http://127.0.0.1:8001/',
    devtoolsFrontend: 'bower_components/mare-devtools-frontend',
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

const resolveHome = (path) => {
    if (path[0] === '~') {
        return libpath.join(process.env.HOME, path.slice(1));
    }
    return path;
};
config.devtoolsFrontend = resolveHome(config.devtoolsFrontend);

console.info('当前构建配置');
console.info(JSON.stringify(config, null, 4));
console.info('');
export default config;
