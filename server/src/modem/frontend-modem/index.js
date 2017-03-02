import EventEmitter from 'events';
import domains from './domains';
import crypto from 'crypto';
import luapkg from '../../tabson/luapkg';

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
        if (result === '__IGNORE_RETURN__') {
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
                    origin: 'http://project',
                    name: '',
                    auxData: {
                        isDefault: true,
                        frameId: '1',
                    },
                },
            },
        };
        this.sendFrontend(resp);
    }


    scriptParsed = async (scriptId, store, endLine = -1) => {
        if (!scriptId.startsWith('@')) {
            return;
        }
        if (store.scriptParsedFiles[scriptId]) {
            return;
        }
        store.scriptParsedFiles[scriptId] = true;
        const md5sum = crypto.createHash('md5');
        md5sum.update(scriptId);

        this.sendFrontend({
            method: 'Debugger.scriptParsed',
            params: {
                endColumn: 0,
                endLine: endLine,
                executionContextAuxData: {
                    frameId: '1',
                    isDefault: true,
                },
                executionContextId: 1,
                hasSourceURL: false,
                hash: md5sum.digest('hex').toUpperCase(),
                isLiveEdit: false,
                scriptId: scriptId,
                sourceMapURL: '',
                startColumn: 0,
                startLine: 0,
                url: luapkg.sourceToUrl(scriptId),
            },
        });
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

    restorePause = async(data, store) => {
        store.debuggerPauseData = data;
        store.frameScriptIdCount += 1;

        let stacks;
        if (data.stacks) {
            stacks = data.stacks.slice();
        } else {
            stacks = [];
        }

        const firstStack = stacks[0];
        let firstStackShifted = false;
        if (firstStack && firstStack.file.includes('hostvm')) {
            stacks.shift();
            firstStackShifted = true;
        }

        await (async () => {
            for (const s of stacks) {
                await this.scriptParsed(s.file, store);
            }
        })();

        const callFrames = stacks.map((s, i) => {
            const callFrameId = JSON.stringify({
                ordinal: firstStackShifted ? (i + 1) : i,
                injectedScriptId: store.frameScriptIdCount,
            });
            const scopeChain = [
                {
                    object: {
                        className: 'Object',
                        description: 'Table',
                        objectId: JSON.stringify({
                            level: firstStackShifted ? (i + 1) : i,
                            group: 'locals',
                        }),
                        type: 'object',
                    },
                    type: 'local',
                },
                {
                    object: {
                        className: 'Object',
                        description: 'Table',
                        objectId: JSON.stringify({
                            level: firstStackShifted ? (i + 1) : i,
                            group: 'upvalues',
                        }),
                        type: 'object',
                    },
                    type: 'closure',
                },
            ];
            return {
                callFrameId,
                functionLocation: {
                    columnNumber: 0,
                    lineNumber: s.line - 1,
                    scriptId: s.file,
                },
                functionName: s.func,
                location: {
                    columnNumber: 0,
                    lineNumber: s.line - 1,
                    scriptId: s.file,

                },
                scopeChain: scopeChain,
            };
        });

        const hitBreakpoints = [];
        const stack = stacks[0];
        const scriptId = stack.file;
        if (scriptId.startsWith('@')) {
            const url = luapkg.sourceToUrl(scriptId);
            hitBreakpoints.push(`${url}:${stack.line - 1}:0`);
        }

        const resp = {
            method: 'Debugger.paused',
            params: {
                callFrames,
                hitBreakpoints: hitBreakpoints,
                reason: 'other',
                data: {step: data.step},
            },
        };
        this.sendFrontend(resp);
    }

    restoreResumed = async (data, store) => {
        store.debuggerPauseData = null;
        const resp = {
            method: 'Debugger.resumed',
            params: {},
        };
        this.sendFrontend(resp);
    }

    updateBreakpoints = async (store) => {
        let breakpoints;
        if (store.activeBreakpoints) {
            breakpoints = await store.breakpointGetAll();
            for (const breakpoint of breakpoints) {
                delete breakpoint.breakpointId;
            }
        } else {
            breakpoints = [];
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

    getStackScope = async (reqId, level, keys, type) => {
        const method = 'behavior.queryScope';
        const params = {
            parrot: {id: reqId, keys},
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

    getRepl = async (reqId, code) => {
        const method = 'behavior.queryRepl';
        const params = {
            parrot: {id: reqId},
            code: code,
        };
        this.sendBackend({method, params});
    }
}
