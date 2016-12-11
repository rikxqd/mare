import {MongoClient} from 'mongodb';
import EventEmitter from 'events';

export class Storage extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.db = null;
    }

    start = async () => {
        this.db = await MongoClient.connect(this.config.database);
    }

    getSessionDatabase() {
        return this.db;
    }
}
