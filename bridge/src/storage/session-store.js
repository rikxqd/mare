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
        const doc = Object.assign({_id: session.id}, session);
        delete doc.id;
        await this.cln.update({_id: session.id}, doc, {upsert: true});
    }

    remove = async (sessionId) => {
        await this.cln.deleteOne({_id: sessionId});
    }

}
