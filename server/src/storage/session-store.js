import EventEmitter from 'events';

export class SessionStore extends EventEmitter {

    constructor(cln) {
        super();
        this.cln = cln;
    }

    get = async () => {
        const docs = await this.cln.find().toArray();
        for (const doc of docs) {
            doc.id = doc._id;
            delete doc._id;
        }
        return docs;
    }

    update = async (session) => {
        const query = {_id: session.id};
        const doc = Object.assign({}, query, session);
        delete doc.id;
        await this.cln.findOneAndReplace(query, doc, {upsert: true});
    }

    remove = async (sessionId) => {
        await this.cln.deleteOne({_id: sessionId});
    }

}
