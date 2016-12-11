import EventEmitter from 'events';

export class LoggingStore extends EventEmitter {

    constructor(cln) {
        super();
        this.cln = cln;
    }

    get = async (type, filter) => {
        const query = Object.assign({_type: type}, filter);
        const docs = await this.cln.find(query).toArray();
        for (const doc of docs) {
            delete doc._id;
            delete doc._type;
        }
        return docs;
    }

    append = async (type, log) => {
        const doc = Object.assign({_type: type}, log);
        await this.cln.insertOne(doc);
    }

    remove = async (type, filter) => {
        const query = Object.assign({_type: type}, filter);
        await this.cln.deleteMany(query);
    }

}
