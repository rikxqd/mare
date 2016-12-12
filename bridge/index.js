import {WebApp} from './src/webapp';
import {Bridge} from './src/bridge';
import packageJson from './package.json';

const webapp = new WebApp(packageJson);
const config = {
    storage: {
        database: 'mongodb://localhost:27017/ldb',
    },
    session: {
        expire: 30,
    },
    frontend: {
        host: '0.0.0.0',
        port: 9223,
    },
    backend: {
        host: '0.0.0.0',
        port: 8083,
    },
};
const bridge = new Bridge(config);

const frontendAddress = `${config.frontend.host}:${config.frontend.port}`;
const backendAddress = `${config.backend.host}:${config.backend.port}`;
console.info(`HTTP server: http://${frontendAddress}/\n`);
console.info(`Lua server: socket://${backendAddress}/\n`);
console.info(bridge);
bridge.mount(webapp);
bridge.start();

process.on('unhandledRejection', (reason, promise) => {
    console.error({promise, reason});
});
