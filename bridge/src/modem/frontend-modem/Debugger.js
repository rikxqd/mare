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
    store.blackboxRemoveAll();
    //modem.scriptParseProject(store);
    modem.pushProjectConfigToBackend(store);
    modem.pushProjectConfigToBackend(store);
    return null;
};

Debugger.setBreakpointByUrl = async (req, store, modem) => {
    const {url, lineNumber, columnNumber, condition} = req.params;
    const breakpointId = `${url}:${lineNumber}:${columnNumber}`;
    const breakpoint = {
        breakpointId: breakpointId,
        event: 'line',
        file: '@' + url.replace('file:///', ''),
        line: lineNumber + 1,
        cond: condition,
    };
    await store.breakpointAppendOne(breakpoint);
    modem.updateBreakpoints(store);
    return {
        breakpointId,
        locations: [],
    };
};

Debugger.getScriptSource = async (req, store) => {
    if (req.params.scriptId.endsWith('-stdin')) {
        return {scriptSource: '-- No Source Code: this script evaluated on stdin'};
    }
    const project = store.project;
    let path = req.params.scriptId.replace('@', '');
    if (path.startsWith('./')) {
        path = path.replace('./', '');
    }
    const url = `${project.sourceRoot}/${path}`;
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
    modem.debuggerStepUp(null);
    modem.debuggerResume();
    return null;
};

Debugger.stepOver = async(req, store, modem) => {
    modem.debuggerStepUp('over');
    modem.debuggerResume();
    return null;
};

Debugger.stepOut = async(req, store, modem) => {
    modem.debuggerStepUp('out');
    modem.debuggerResume();
    return null;
};

Debugger.stepInto = async(req, store, modem) => {
    modem.debuggerStepUp('into');
    modem.debuggerResume();
    return null;
};

Debugger.setSkipAllPauses = async(req, store, modem) => {
    modem.debuggerSkip(req.params.skip);
    return null;
};

Debugger.setPauseOnExceptions = async(req, store, modem) => {
    modem.debuggerPauseTrapper(req.params.state);
    return null;
};

Debugger.setBlackboxedRanges = async(req, store, modem) => {
    const scriptId = req.params.scriptId;
    const positions = req.params.positions;
    if (positions.length > 0) {
        const blackbox = {
            blackboxId: scriptId,
            file: scriptId,
            start_line: positions[0].lineNumber + 1,
            end_line: 0,
        };
        await store.blackboxAppendOne(blackbox);
    } else {
        await store.blackboxRemoveOne(scriptId);
    }
    modem.updateBlackboxes(store);
    return null;
};

Debugger.evaluateOnCallFrame = async(req, store, modem) => {
    const level = JSON.parse(req.params.callFrameId).ordinal;
    modem.getStackWatch(req.id, level, req.params.expression);
    return '__IGNORE_RETURN__';
};

export default Debugger;
