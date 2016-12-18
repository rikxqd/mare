import libpath from 'path';
import EventEmitter from 'events';

const resolveHome = (filepath) => {
    if (filepath[0] === '~') {
        return libpath.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
};

export class SessionDataStore extends EventEmitter {

    constructor(cln) {
        super();
        this.cln = cln;
        this.project = {
            id: 'lualib',
            sourceRoot: resolveHome('~/work/ldb/lualib/'),
            mainFile: 'test2.lua',
        };
    }

    destroy() {
        this.cln = null;
    }

    drop = async () => {
        this.cln.drop();
    }

    eventGetByMethod = async (method) => {
        const query = {_type: 'event', method};
        const docs = await this.cln.find(query).toArray();
        for (const doc of docs) {
            delete doc._id;
            delete doc._type;
        }
        return docs;
    }

    eventGetAll = async () => {
        const query = {_type: 'event'};
        const docs = await this.cln.find(query).toArray();
        for (const doc of docs) {
            delete doc._id;
            delete doc._type;
        }
        return docs;
    }

    eventAppendOne = async (event) => {
        const doc = Object.assign({_type: 'event'}, event);
        await this.cln.insertOne(doc);
    }

    eventRemoveByMethod = async (method) => {
        const query = {_type: 'event', method};
        await this.cln.deleteMany(query);
    }

    eventRemoveAll = async () => {
        const query = {_type: 'event'};
        await this.cln.deleteMany(query);
    }

    jsobjGet = async (jsobj_id) => {
        const query = {_type: 'jsobj', _jsobj_id: jsobj_id};
        const doc = await this.cln.findOne(query);
        delete doc._id;
        delete doc._type;
        delete doc._jsobj_id;
        return doc;
    }

    jsobjAppendOne = async (jsobj_id, jsobj) => {
        const query = {_type: 'jsobj', _jsobj_id: jsobj_id};
        const doc = Object.assign({}, query, jsobj);
        await this.cln.insertOne(doc);
    }

}
