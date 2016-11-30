import fs from 'fs';
import minimist from 'minimist';

const config = {
    httpUrl: 'http://0.0.0.0:5655/',
    apiUrl: 'http://0.0.0.0:5645/',
};

{
    const file = './builder.json';
    if (fs.existsSync(file)) {
        const text = fs.readFileSync(file, 'utf-8');
        const fileConfig = JSON.parse(text);
        Object.assign(config, fileConfig);
    }
}

{
    const cmdConfig = minimist(process.argv.slice(2), {stopEarly: true});
    delete cmdConfig._;
    Object.assign(config, cmdConfig);
}

console.info('当前构建配置');
console.info(JSON.stringify(config, null, 4));
console.info('');
export default config;
