import EventEmitter from 'events';

export class Store extends EventEmitter {

    constructor(id, db) {
        super();
        this.id = id;
        this.db = db;
        this.eventCln = db.collection(`session.${id}`);
        this.logCln = db.collection('logs');
    }

    destroy() {
        this.db = null;
        this.eventCln = null;
        this.logCln = null;
    }

    getEvents = async () => {
        const docs = await this.eventCln.find().toArray();
        for (const doc of docs) {
            delete doc._id;
        }
        return docs;
    }

    appendEvent = async (event) => {
        await this.eventCln.insertOne(event);
    }

    removeEvents = async (method) => {
        await this.eventCln.deleteMany({method});
    }

    clearEvents = async () => {
        await this.eventCln.drop();
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
        await this.logCln.remove(query);
    }

}
