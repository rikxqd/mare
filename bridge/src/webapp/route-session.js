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
            success: false,
            existId: true,
        });
        return;
    }
    sm.addSession(id, {title, expire: 0, createSide: 'control'});
    resp.json({success: true});
});

app.get('/session/:id', (req, resp) => {
    const bridge = req.bridge;
    const session = bridge.sm.getSession(req.params.id);
    if (session === null) {
        resp.json(null);
        return;
    }
    resp.json(session.getJSON());
});

app.get('/session/', (req, resp) => {
    const bridge = req.bridge;
    const items = [];
    const publicAddress = req.headers.host;
    for (const session of bridge.sm.getSessions()) {
        const item = session.getJSON();
        item.wsPath = `${publicAddress}/session/${session.id}`;
        items.push(item);
    }
    resp.json(items);
});

export default app;
