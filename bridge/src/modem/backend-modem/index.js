import EventEmitter from 'events';
import uuid from 'node-uuid';
import crypto from 'crypto';
import {Tabson} from '../../tabson';
import rehost from '../../tabson/rehost';

export class BackendModem extends EventEmitter {

    constructor() {
        super();
        this.nonFileScriptIdCount = 0;
        this.frameScriptIdCount = 0;
    }

    sendFrontend(value) {
        this.emit('send-frontend', value);
    }

    sendBackend(value) {
        this.emit('send-backend', value);
    }

    deliver = async (msg, store) => {
        if (msg.method === 'consoleApi') {
            this.consoleApi(msg.params, store);
        }
        if (msg.method === 'executePaused') {
            this.debuggerPause(msg.params, store);
        }
        if (msg.method === 'executeResumed') {
            this.debuggerResumed(msg.params, store);
        }
        if (msg.method === 'stackScope') {
            this.stackScope(msg.params, store);
        }
        if (msg.method === 'stackWatch') {
            this.stackWatch(msg.params, store);
        }
        if (msg.method === 'repl') {
            this.repl(msg.params, store);
        }
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

        let path = scriptId.replace('@', '');
        if (path.startsWith('./')) {
            path = path.replace('./', '');
        }

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
                url: `file:///${path}`,
            },
        });
    }

    consoleApi  = async (data, store) => {
        const stacks = data.stacks || [];

        const firstStack = stacks[0];
        if (firstStack && firstStack.file.includes('hostvm')) {
            stacks.shift();
        }

        await (async () => {
            for (const s of stacks) {
                await this.scriptParsed(s.file, store);
            }
        })();

        const frames = stacks.map((s) => {
            let scriptId, url;
            if (s.file === '=stdin') {
                this.nonFileScriptParsed(data);
                scriptId = `${this.nonFileScriptIdCount}-stdin`;
                url = '';
            } else {
                scriptId = s.file;
                let path = scriptId.replace('@', '');
                if (path.startsWith('./')) {
                    path = path.replace('./', '');
                }
                url = `file:///${path}`;
            }

            return {
                columnNumber: 0,
                functionName: s.func,
                lineNumber: s.line - 1,  // lua 从 1 开始
                scriptId: scriptId,
                url: url,
            };
        });

        const props = {id: uuid.v4(), group: 'console'};
        const docId = JSON.stringify(props);
        store.jsobjAppendOne(docId, data.value);

        const argsField = [];
        for (let i = 0; i < data.value.length; i++) {
            let value = data.value[i];
            const vProps = Object.assign({index: i}, props);
            if (value.vmtype === 'host') {
                value = rehost(value);
            }
            const tv = new Tabson(value, vProps);
            argsField.push(tv.value());
        }

        const resp = {
            method: 'Runtime.consoleAPICalled',
            params: {
                args: argsField,
                executionContextId: 1,
                stackTrace: {
                    callFrames: frames,
                },
                timestamp: new Date().getTime(),
                type: data.type || 'log',
            },
        };
        store.eventAppendOne(resp);
        this.sendFrontend(resp);
    }

    nonFileScriptParsed = async () => {
        this.nonFileScriptIdCount += 1;
        const scriptId = `${this.nonFileScriptIdCount}-stdin`;
        const md5sum = crypto.createHash('md5');
        md5sum.update(scriptId);
        this.sendFrontend({
            method: 'Debugger.scriptParsed',
            params: {
                endColumn: 0,
                endLine: 1,
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
                url: '',
            },
        });
    }

    debuggerPause = async(data, store) => {
        this.frameScriptIdCount += 1;

        const stacks = data.stacks || [];

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
                injectedScriptId: this.frameScriptIdCount,
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

        const resp = {
            method: 'Debugger.paused',
            params: {
                callFrames,
                hitBreakpoints: [
                    do {
                        const s = stacks[0];
                        const file = s.file.replace('@', '').replace('./', '');
                        `file:///${file}:${s.line - 1}:0`;
                    },
                ],
                reason: 'other',
            },
        };
        this.sendFrontend(resp);
    }

    stackScope = async (data, store) => {
        const props = {id: uuid.v4(), group: `${data.type}-result`};
        const docId = JSON.stringify(props);
        store.jsobjAppendOne(docId, data.value);
        const result = [];
        for (const [k, v] of Object.entries(data.value)) {
            const vProps = Object.assign({index: k}, props);
            const re = rehost(v);
            const tv = new Tabson(re, vProps);

            const arg = {
                configurable: false,
                enumerable: true,
                isOwn: true,
                writable: false,
                name: k,
                value: tv.value(),
            };
            result.push(arg);
        }
        const resp = {id: data.parrot.id, result: {result}};
        this.sendFrontend(resp);
    }

    stackWatch = async (data, store) => {
        const props = {id: uuid.v4(), group: 'watch'};
        const docId = JSON.stringify(props);
        store.jsobjAppendOne(docId, data.value);
        let dumped = data.value;
        if (dumped.vmtype === 'host') {
            dumped = rehost(dumped);
        }
        const tv = new Tabson(dumped, props);
        const valueFeild = tv.value();
        const result = {result: valueFeild};
        if (data.error) {
            result.exceptionDetails = {
                columnNumber: 0,
                lineNumber: 0,
                text: valueFeild.value.description,
                exceptionId: new Date().getTime(),
            };
        }
        const resp = {id: data.parrot.id, result};
        this.sendFrontend(resp);
    }

    repl = async (data, store) => {
        const props = {id: uuid.v4(), group: 'repl'};
        const docId = JSON.stringify(props);
        store.jsobjAppendOne(docId, data.value);
        let dumped = data.value;
        if (dumped.vmtype === 'host') {
            dumped = rehost(dumped);
        }
        const tv = new Tabson(dumped, props);
        const valueFeild = tv.value();
        const result = {result: valueFeild};
        if (data.error) {
            result.exceptionDetails = {
                columnNumber: 0,
                lineNumber: 0,
                text: valueFeild.value.description,
                exceptionId: new Date().getTime(),
            };
        }
        const resp = {id: data.parrot.id, result};
        this.sendFrontend(resp);
    }

    debuggerResumed = async () => {
        const resp = {
            method: 'Debugger.resumed',
            params: {},
        };
        this.sendFrontend(resp);
    }
}
