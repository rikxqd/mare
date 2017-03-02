import libpath from 'path';
import fs from 'fs';
import luapkg from '../../tabson/luapkg';

const readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, data) => {
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
    store.activeBreakpoints = true;
    setTimeout(() => {
        if (store.debuggerPauseData) {
            modem.restorePause(store.debuggerPauseData, store);
        }
    }, 1000);
    return null;
};

Debugger.setBreakpointByUrl = async (req, store, modem) => {
    const {url, lineNumber, columnNumber, condition} = req.params;
    const breakpointId = `${url}:${lineNumber}:${columnNumber}`;

    if (url.startsWith('http://other/')) {
        return {breakpointId, locations: []};
    }

    let file;
    if (url.startsWith('http://project/')) {
        file = url.replace('http://project/', '@');
    } else {
        file = url.replace('http://root/', '');
        if ((!file.startsWith('/')) && (!libpath.win32.isAbsolute(file))) {
            file = '@/' + file;
        } else {
            file = '@' + file;
        }
    }

    const breakpoint = {
        breakpointId: breakpointId,
        event: 'line',
        file: file,
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
    if (req.params.scriptId.startsWith('=stdin')) {
        return {scriptSource: '-- No Source Code: this script evaluated on stdin'};
    }
    const project = store.project;
    const abspath = luapkg.sourceToFile(req.params.scriptId, project.folder);

    let content = '';
    try {
        content = await readFile(abspath);
    } catch (e) {
        content = `-- ${e}`;
    }
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

Debugger.setBreakpointsActive = async(req, store, modem) => {
    store.activeBreakpoints = req.params.active;
    modem.updateBreakpoints(store);
};

export default Debugger;
