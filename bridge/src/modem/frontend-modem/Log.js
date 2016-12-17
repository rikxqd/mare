const Log = {};

Log.enable = async (req, store, modem) => {
    modem.replayFrontendLogEvents(store);
    return null;
};

Log.clear = async (req, store) => {
    await store.eventRemoveByMethod('Log.entryAdded');
    return null;
};

export default Log;
