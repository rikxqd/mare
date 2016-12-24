const Runtime = {};

Runtime.enable = async (req, store, modem) => {
    modem.contextCreated();
    modem.replayFrontendRuntimeEvents(store);
    return null;
};

const getRunningProperties = async(req, store, modem, objectId) => {
    modem.getStackLocals(req.id, objectId.localLevel);
    return 'ignoreme';
};

Runtime.getProperties = async(req, store, modem) => {

    const objectId = JSON.parse(req.params.objectId);
    console.log(objectId.localLevel, objectId.localLevel !== undefined);
    if (objectId.localLevel !== undefined) {
        return await getRunningProperties(req, store, modem, objectId);
    }

    if (!req.params.ownProperties) {
        return {result: []};
    }

    const rootObjectId = JSON.stringify({
        root: objectId.root, path: [],
    });
    const root = await store.jsobjGet(rootObjectId);
    let jsobj = root;
    for (const path of objectId.path) {
        jsobj = jsobj[path];
    }

    const props = [];
    for (const [key, value] of Object.entries(jsobj)) {
        const valueType = typeof value;
        let valueFeild;
        if (valueType === 'object') {
            const path = [...objectId.path, key];
            valueFeild = {
                description: 'Table',
                objectId: JSON.stringify({
                    root: objectId.root,
                    type: valueType,
                    path: path,
                }),
            };
        } else {
            valueFeild = {
                description: String(value),
                type: valueType,
                value: value,
            };
        }

        const prop = {
            configurable: false,
            enumerable: true,
            isOwn: true,
            name: key,
            value: valueFeild,
            writable: false,
        };
        props.push(prop);
    }
    return {result: props};
};


export default Runtime;
