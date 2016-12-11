import EventEmitter from 'events';

export class SessionDataStore extends EventEmitter {

    constructor(cln) {
        super();
        this.cln = cln;
    }

    destroy() {
        this.cln = null;
    }

    drop = async () => {
        this.cln.drop();
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

}
