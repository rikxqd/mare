const Runtime = {};

Runtime.enable = async (req, store, modem) => {
    modem.contextCreated();
    modem.replayFrontendRuntimeEvents(store);
    return null;
};

const getLocalsProperties = async(req, store, modem, objectId) => {
    modem.getStackScope(req.id, objectId.localsLevel, 'locals');
    return 'ignoreme';
};

const getUpvaluesProperties = async(req, store, modem, objectId) => {
    modem.getStackScope(req.id, objectId.upvaluesLevel, 'upvalues');
    return 'ignoreme';
};

Runtime.getProperties = async(req, store, modem) => {

    const objectId = JSON.parse(req.params.objectId);
    console.log(objectId.localLevel, objectId.localLevel !== undefined);
    if (objectId.localsLevel !== undefined) {
        return await getLocalsProperties(req, store, modem, objectId);
    }
    if (objectId.upvaluesLevel !== undefined) {
        return await getUpvaluesProperties(req, store, modem, objectId);
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

Runtime.discardConsoleEntries = async (req, store) => {
    await store.eventRemoveByMethod('Runtime.consoleAPICalled');
    return null;
};

export default Runtime;
