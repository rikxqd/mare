import {WebApp} from './src/webapp';
import {Bridge} from './src/bridge';
import packageJson from './package.json';

const webapp = new WebApp(packageJson);
const config = {
    storage: {
        database: './dbdata/',
        //database: 'mongodb://127.0.0.1:27017/mare',
    },
    session: {
        expire: 30,
    },
    frontend: {
        host: '127.0.0.1',
        port: 9223,
    },
    backend: {
        host: '127.0.0.1',
        port: 8083,
    },
};
const bridge = new Bridge(config);

const frontendAddress = `${config.frontend.host}:${config.frontend.port}`;
const backendAddress = `${config.backend.host}:${config.backend.port}`;
console.info(`HTTP server: http://${frontendAddress}/\n`);
console.info(`Lua server: socket://${backendAddress}/\n`);
bridge.mount(webapp);
bridge.start();

process.on('unhandledRejection', (reason) => {
    console.error(reason.stack);
});
