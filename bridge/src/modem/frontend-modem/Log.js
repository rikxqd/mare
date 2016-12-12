const Log = {};

Log.enable = async () => {
    return null;
};

Log.clear = async (req, store) => {
    await store.eventRemoveByMethod('Log.entryAdded');
    return null;
};

export default Log;
