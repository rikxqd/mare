import bodyParser from 'body-parser';
import express from 'express';
import os from 'os';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/overview', (req, resp) => {
    const bridge = req.bridge;
    const config = bridge.config;

    const system = {
        hostname: os.hostname(),
        nodejs: process.version,
        os: `${os.type()} ${os.release()}`,
        time: new Date().getTime(),
        uptime: os.uptime(),
    };

    const server = {
        version: req.packsageJSON.version,
        uptime: process.uptime(),
        pid: process.pid,
        frontend: {
            host: config.frontend.host,
            port: config.frontend.port,
        },
        backend: {
            host: config.backend.host,
            port: config.backend.port,
        },
    };

    const session = do {
        const sessions = bridge.sm.getSessions();
        const activiting = sessions.filter((s) => s.isActiviting());
        ({
            total: sessions.length,
            activiting: activiting.length,
        });
    };

    const project = {
        total: 0,
    };

    const info = {system, server, session, project};
    resp.json(info);
});

app.get('/config', (req, resp) => {
    const bridge = req.bridge;
    resp.json(bridge.config);
});

export default app;
