import controller from './src/controller';
import {Bridge} from './src/bridge';

console.log(controller);
const config = {
    controller: controller,
    frontend: {
        host: '0.0.0.0',
        port: 9223,
    },
    backend: {
        host: '0.0.0.0',
        port: 8083,
    },
    session: {
        autoCloseTimeout: 3600,
    },
};
const bridge = new Bridge(config);
const frontendAddress = `${config.frontend.host}:${config.frontend.port}`;
const backendAddress = `${config.backend.host}:${config.backend.port}`;
console.info(`HTTP 服务器地址：http://${frontendAddress}/\n`);
console.info(`Lua 调试器地址：${backendAddress}\n`);
bridge.start();
