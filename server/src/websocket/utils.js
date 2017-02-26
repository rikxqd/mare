import liburl from 'url';
import uuid from 'node-uuid';

export default {

    id: (prefix) => {
        return `${prefix}:${uuid.v4()}`;
    },

    location: (ws) => {
        const url = decodeURIComponent(ws.upgradeReq.url).replace(/\|/, '&');
        return liburl.parse(url, true);
    },

};
