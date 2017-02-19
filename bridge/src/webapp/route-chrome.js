import express from 'express';
import libpath from 'path';

const devtoolsTpl = 'chrome-devtools://devtools/bundled/inspector.html';
const versionPath = libpath.resolve('./src/webapp/assets/version.json');
const app = express();

app.get('/json/version', (req, resp) => {
    resp.sendFile(versionPath);
});

app.get('/json', (req, resp) => {
    const bridge = req.bridge;
    const frontendConfig = bridge.config.frontend;
    const listenAddress = `${frontendConfig.host}:${frontendConfig.port}`;

    const publicAddress = req.headers.host || listenAddress;
    const faviconUrl = `${req.protocol}://${publicAddress}/favicon.ico`;

    const items = [];
    for (const session of bridge.sm.getSessions()) {
        const websocketUrl = `${publicAddress}/session/${session.id}`;
        const webSocketDebuggerUrl = `ws://${websocketUrl}`;
        const devtoolsFrontendUrl = `${devtoolsTpl}&ws=${websocketUrl}`;

        const item = {
            description: '',
            faviconUrl: faviconUrl,
            id: session.id,
            title: session.title,
            type: 'lua',
            url: `lua://session/${session.id}`,
        };
        if (!session.isFrontendConnected) {
            item.webSocketDebuggerUrl = webSocketDebuggerUrl;
            item.devtoolsFrontendUrl = devtoolsFrontendUrl;
        }
        items.push(item);
    }
    resp.json(items);
});

export default app;
