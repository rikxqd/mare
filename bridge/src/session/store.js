import EventEmitter from 'events';

export class Store extends EventEmitter {

    constructor(id, db) {
        super();
        this.id = id;
        this.db = db;
        this.cln = db.collection(`session.${id}`);
    }

    destroy() {
        this.db = null;
        this.cln = null;
    }

    saveEvent = async (event) => {
        return this.cln.insertOne(event);
    }

    loadEvents = async () => {
        return this.cln.find().toArray();
    }

    deleteEvents = async (method) => {
        return this.cln.deleteMany({method});
    }

}
