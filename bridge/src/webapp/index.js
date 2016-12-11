import express from 'express';
import routeChrome from './route-chrome';
import routeInfo from './route-info';
import routeMisc from './route-misc';
import routeSession from './route-session';

const app = express();
app.set('json spaces', 4);

app.use(routeChrome);
app.use(routeInfo);
app.use(routeSession);
app.use(routeMisc);

app.get('/', (req, resp) => {
    const version = req.packsageJSON.version;
    resp.json({version});
});

const WebApp = function(packsageJSON) {
    return (req, resp) => {
        req.packsageJSON = packsageJSON;
        return app(req, resp);
    };
};

export {WebApp};
