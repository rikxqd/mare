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
    modem.scriptParsed(store);
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
            file: `@${scriptId}`,
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
    if (req.params.objectGroup !== 'watch-group') {
        return null;
    }
    modem.getStackWatch(req.id, req.params.expression);
    return 'ignoreme';
};

export default Debugger;
