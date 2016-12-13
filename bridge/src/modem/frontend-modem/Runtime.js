const Runtime = {};

Runtime.enable = async (req, store, modem) => {
    modem.contextCreated();
    return null;
};

export default Runtime;
