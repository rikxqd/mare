import controller from './src/controller';
import {Bridge} from './src/bridge';

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
        removeExpire: 60,
    },
};
const bridge = new Bridge(config);
const frontendAddress = `${config.frontend.host}:${config.frontend.port}`;
const backendAddress = `${config.backend.host}:${config.backend.port}`;
console.info(`HTTP server: http://${frontendAddress}/\n`);
console.info(`Lua server: socket://${backendAddress}/\n`);
console.info(bridge);
bridge.start();
