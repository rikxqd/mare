import bodyParser from 'body-parser';
import express from 'express';
import libpath from 'path';

const iconPath = libpath.resolve('./src/webapp/assets/favicon.ico');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/echo', (req, resp) => {
    console.info(req);
    const result =  {
        query: req.query,
        body: req.body,
        url: req.url,
    };
    resp.json(result);
});

app.get('/favicon.ico', (req, resp) => {
    resp.sendFile(iconPath, (err) => {
        if (err) {
            console.error(err);
            resp.status(err.status).end();
        }
    });
});

export default app;
