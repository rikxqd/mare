import EventEmitter from 'events';
import domains from './domains';
import fs from 'fs';
import glob from 'glob';
import crypto from 'crypto';

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

export class FrontendModem extends EventEmitter {

    constructor() {
        super();
    }

    sendFrontend(value) {
        this.emit('send-frontend', value);
    }

    sendBackend(value) {
        this.emit('send-backend', value);
    }

    deliver = async (msg, store) => {
        const [domain, prop] = msg.method.split('.');
        let func;
        try {
            func = domains[domain][prop];
        } catch (e) {
            func = null;
        }

        let result;
        if (func) {
            result = await func(msg, store, this);
        }
        if (result === 'ignoreme') {
            return;
        }

        if (result === null) {
            result = {};
        }

        const resp = {id: msg.id, result};
        this.sendFrontend(resp);
    }

    contextCreated = async () => {
        const resp = {
            method: 'Runtime.executionContextCreated',
            params: {
                context: {
                    id: 1,
                    origin: 'file://',
                    name: 'Lua Host VM',
                    auxData: {
                        isDefault: true,
                        frameId: '1',
                    },
                },
            },
        };
        this.sendFrontend(resp);
    }

    scriptParsed = async (store) => {
        const project = store.project;
        const pattern = `${project.sourceRoot}/**/*.lua`;
        const files = await globFiles(pattern);
        for (const file of files) {
            const path = file.replace(project.sourceRoot, '');
            const content = await readFile(file);
            const lines = content.split('\n');
            const md5sum = crypto.createHash('md5');
            md5sum.update(content);
            this.sendFrontend({
                method: 'Debugger.scriptParsed',
                params: {
                    endColumn: 0,
                    endLine: lines.length,
                    executionContextAuxData: {
                        frameId: '1',
                        isDefault: true,
                    },
                    executionContextId: 1,
                    hasSourceURL: false,
                    hash: md5sum.digest('hex').toUpperCase(),
                    isLiveEdit: false,
                    scriptId: path,
                    sourceMapURL: '',
                    startColumn: 0,
                    startLine: 0,
                    url: `file:///${path}`,
                },
            });
        }
    }

    replayFrontendLogEvents = async (store) => {
        const method = 'Log.entryAdded';
        const events = await store.eventGetByMethod(method);
        for (const event of events) {
            this.sendFrontend(event);
        }
    }

    replayFrontendRuntimeEvents = async (store) => {
        const method = 'Runtime.consoleAPICalled';
        const events = await store.eventGetByMethod(method);
        for (const event of events) {
            this.sendFrontend(event);
        }
    }

    pushProjectConfigToBackend = async (store) => {
        const method = 'updateProjectConfig';
        const params = store.project.id;
        this.sendBackend({method, params});
    }

    debuggerResume = async () => {
        const method = 'behavior.executeResume';
        const params = null;
        this.sendBackend({method, params});
    }

    debuggerSkip = async (value) => {
        const method = 'behavior.setSkipSituation';
        const params = value ? {state: 'always'} : null;
        this.sendBackend({method, params});
    }

    debuggerPauseTrapper = async (value) => {
        const method = 'behavior.setPauseTrapper';
        const params = value !== 'none' ? {state: value} : null;
        this.sendBackend({method, params});
    }

    updateBreakpoints = async (store) => {
        const breakpoints = await store.breakpointGetAll();
        for (const breakpoint of breakpoints) {
            delete breakpoint.breakpointId;
        }
        const method = 'behavior.setPauseBreakpoints';
        const params = breakpoints;
        this.sendBackend({method, params});
    }

    updateBlackboxes = async (store) => {
        const blackboxes = await store.blackboxGetAll();
        for (const blackbox of blackboxes) {
            delete blackbox.blackboxId;
        }
        const method = 'behavior.setSkipBlackBoxes';
        const params = blackboxes;
        this.sendBackend({method, params});
    }

    debuggerStepUp = async (step_type) => {
        const method = 'behavior.setPausePace';
        const params = step_type !== null ? {step_type} : null;
        this.sendBackend({method, params});
    }

    getStackScope = async (reqId, level, type) => {
        const method = 'behavior.queryScope';
        const params = {
            parrot: {id: reqId},
            level: level + 1,
            type: type,
        };
        this.sendBackend({method, params});
    }

    getStackWatch = async (reqId, level, code) => {
        const method = 'behavior.queryWatch';
        const params = {
            parrot: {id: reqId},
            level: level + 1,
            code: code,
        };
        this.sendBackend({method, params});
    }

}
