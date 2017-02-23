export default (cln) => {
    return {
        find: (query) => {
            const result = cln.find(query);
            return {
                toArray: () => new Promise((resolve, reject) => {
                    result.toArray((err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    });
                }),
            };
        },
        findOne: (query) => new Promise((resolve, reject) => {
            cln.findOne(query, null, (err, res) => {
                console.log(query, err, res);
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
        insertOne: (doc) => new Promise((resolve, reject) => {
            cln.insert(doc, null, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
        findOneAndReplace: (query, doc) => new Promise((resolve, reject) => {
            cln.findAndModify(query, [], {$set: doc}, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
        deleteOne: (query) => new Promise((resolve, reject) => {
            const opt = {single: true};
            cln.remove(query, opt, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
        deleteMany: (query) => new Promise((resolve, reject) => {
            const opt = {single: false};
            cln.remove(query, opt, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
        drop: (opt) => new Promise((resolve, reject) => {
            cln.drop(opt, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        }),
    };
};
