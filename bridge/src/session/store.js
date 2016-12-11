import EventEmitter from 'events';

export class Store extends EventEmitter {

    constructor(id, db) {
        super();
        this.id = id;
        this.db = db;
        this.dataCln = db.collection(`session-data.${id}`);
        this.logCln = db.collection('session-log');
    }

    destroy() {
        this.db = null;
        this.dataCln = null;
        this.logCln = null;
    }

    getEvents = async () => {
        const query = {_type: 'event'};
        const docs = await this.dataCln.find(query).toArray();
        for (const doc of docs) {
            delete doc._id;
            delete doc._type;
        }
        return docs;
    }

    appendEvent = async (event) => {
        const doc = Object.assign({_type: 'event'}, event);
        await this.dataCln.insertOne(doc);
    }

    removeEvents = async (method) => {
        const query = {_type: 'event', method};
        await this.dataCln.deleteMany(query);
    }

    clearEvents = async () => {
        const query = {_type: 'event'};
        await this.dataCln.deleteMany(query);
    }

    dropAllData = async () => {
        this.dataCln.drop();
    }

    getLogs = async () => {
        const query = {_session: this.id};
        const docs = await this.logCln.find(query).toArray();
        const logs = [];
        for (const doc of docs) {
            delete doc._id;
            delete doc._session;
            logs.push(doc);
        }
        return logs;
    }

    appendLog = async (log) => {
        const doc = Object.assign({_session: this.id}, log);
        await this.logCln.insertOne(doc);
    }

    saveLogs = async (logs) => {
        await this.clearLogs();
        const docs = [];
        for (const log of logs) {
            const doc = Object.assign({_session: this.id}, log);
            docs.push(doc);
        }
        await this.logCln.insertMany(docs);
    }

    clearLogs = async () => {
        const query = {_session: this.id};
        await this.logCln.deleteMany(query);
    }

}
