import Bridge from './src/bridge';

new Bridge({
    host: '0.0.0.0',
    port: 9223,
    luadebug: {
        host: '0.0.0.0',
        port: 8083,
    },
}).start();
