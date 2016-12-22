import fs from 'fs';
import glob from 'glob';

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

const globFiles = (pattern) => {
    return new Promise((resolve, reject) => {
        glob(pattern, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
};

const Debugger = {};

Debugger.enable = async (req, store, modem) => {
    modem.scriptParsed(store);
    modem.pushProjectConfigToBackend(store);
    modem.pushProjectConfigToBackend(store);
    return null;
};

Debugger.setBreakpointByUrl = async (req, store, modem) => {
    const {url, lineNumber, columnNumber} = req.params;
    modem.setBreakpointByUrl(url, lineNumber);
    return {
        breakpointId: `${url}:${lineNumber}:${columnNumber}`,
        locations: [],
    };
};

Debugger.getScriptSource = async (req, store) => {
    const project = store.project;
    const url = `${project.sourceRoot}/${req.params.scriptId}`;
    const content = await readFile(url);
    return {scriptSource: content};
};

Debugger.removeBreakpoint = async (req, store) => {
    console.log(req);
    return null;
};

Debugger.resume = async(req, store, modem) => {
    modem.debuggerResume()
    return null
}

export default Debugger;
