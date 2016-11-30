class Postal {

    constructor() {
        this.listeners = {};
    }

    sub(topic, func) {
        let funcs = this.listeners[topic];
        if (funcs === undefined) {
            funcs = [];
            this.listeners[topic] = funcs;
        }
        funcs.push(func);
        return () => {
            this.unsub(topic, func);
        };
    }

    unsub(topic, func) {
        const funcs = this.listeners[topic];
        if (funcs === undefined) {
            return;
        }
        const index = funcs.findIndex((f) => f === func);
        funcs.splice(index, 1);
        if (funcs.length === 0) {
            delete this.listeners[topic];
        }
    }

    pub(topic, args) {
        const funcs = this.listeners[topic];
        if (funcs === undefined) {
            return;
        }
        for (const func of funcs) {
            try {
                func(args);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
}

export {Postal};
