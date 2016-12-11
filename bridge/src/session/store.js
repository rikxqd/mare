import EventEmitter from 'events';

export class Store extends EventEmitter {

    constructor(id, db) {
        super();
        this.id = id;
        this.db = db;
        this.logCln = db.collection('logs');
        this.eventCln = db.collection(`session.${id}`);
    }

    destroy() {
        this.db = null;
        this.eventCln = null;
    }

    saveEvent = async (event) => {
        return this.eventCln.insertOne(event);
    }

    loadEvents = async () => {
        return this.eventCln.find().toArray();
    }

    deleteEventByMethod = async (method) => {
        return this.eventCln.deleteMany({method});
    }

    loadLogs = async (logs) => {
        const doc = {_id: this.id, logs};
        this.logCln.updateOne({_id: this.id}, doc, {upsert: true});
    }

    saveLogs = async () => {
        return this.logCln.find({_id: this.id}).toArray();
    }

}
