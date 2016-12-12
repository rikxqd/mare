import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/session/new', (req, resp) => {
    const sm = req.bridge.sm;
    const {id, title} = req.body;
    if (sm.existSession(id)) {
        resp.json({
            ok: false,
            existed: true,
        });
        return;
    }

    const creator = 'webapp';
    const expired = -1;
    const session = sm.addSession(id, {title, expired, creator});
    session.saveToStorage(id);
    resp.json({ok: true});
});

app.get('/session/:id', (req, resp) => {
    const sm = req.bridge.sm;
    const session = sm.getSession(req.params.id);
    if (session === null) {
        resp.json(null);
        return;
    }

    const item = session.toJSON();
    item.logs = session.logs;
    resp.json(item);
});

app.get('/session/', (req, resp) => {
    const sm = req.bridge.sm;
    const items = [];
    const publicAddress = req.headers.host;
    for (const session of sm.getSessions()) {
        const item = session.toJSON();
        item.wsPath = `${publicAddress}/session/${session.id}`;
        items.push(item);
    }
    resp.json(items);
});

export default app;
