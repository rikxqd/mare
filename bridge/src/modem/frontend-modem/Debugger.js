import fs from 'fs';

const readFile = (url) => {
    return new Promise((resolve, reject) => {
        fs.readFile(url, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    });
};

const Debugger = {};

Debugger.enable = async (req, store, modem) => {
    store.breakpointRemoveAll();
    modem.scriptParsed(store);
    modem.pushProjectConfigToBackend(store);
    modem.pushProjectConfigToBackend(store);
    return null;
};

Debugger.setBreakpointByUrl = async (req, store, modem) => {
    const {url, lineNumber, columnNumber} = req.params;
    const breakpointId = `${url}:${lineNumber}:${columnNumber}`;
    await store.breakpointAppendOne({breakpointId});
    modem.updateBreakpoints(store);
    return {
        breakpointId,
        locations: [],
    };
};

Debugger.getScriptSource = async (req, store) => {
    const project = store.project;
    const url = `${project.sourceRoot}/${req.params.scriptId}`;
    const content = await readFile(url);
    return {scriptSource: content};
};

Debugger.removeBreakpoint = async (req, store, modem) => {
    const breakpointId = req.params.breakpointId;
    await store.breakpointRemoveOne(breakpointId);
    modem.updateBreakpoints(store);
    return null;
};

Debugger.resume = async(req, store, modem) => {
    modem.debuggerStepNull();
    modem.debuggerResume();
    return null;
};

Debugger.stepOver = async(req, store, modem) => {
    modem.debuggerStepOver();
    modem.debuggerResume();
    return null;
};

export default Debugger;
