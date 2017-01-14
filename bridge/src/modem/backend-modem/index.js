import EventEmitter from 'events';
import uuid from 'node-uuid';
import crypto from 'crypto';
import {Tabson} from '../../tabson';

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

    consoleApi  = async (data, store) => {
        const project = store.project;

        const stacks = data.stacks || [];
        const frames = stacks.map((s) => {
            let scriptId, url;
            if (s.file === '=stdin') {
                this.nonFileScriptParsed(data);
                scriptId = `${this.nonFileScriptIdCount}-stdin`;
                url = '';
            } else {
                scriptId = s.file;
                const path = scriptId.replace('@./', '');
                url = `${project.id}/${path}`;
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
        const tv = new Tabson(data.value, props);
        const argsField = tv.props().result.map((e) => e.value);

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

    debuggerPause = async(data) => {
        this.frameScriptIdCount += 1;

        const callFrames = data.stacks.map((s, i) => {
            const callFrameId = JSON.stringify({
                ordinal: i,
                injectedScriptId: this.frameScriptIdCount,
            });
            const scopeChain = [
                {
                    name: s.func,
                    object: {
                        className: 'Object',
                        description: 'Object',
                        objectId: JSON.stringify({
                            level: i,
                            group: 'locals',
                        }),
                        type: 'object',
                    },
                    type: 'local',
                },
                {
                    name: s.func,
                    object: {
                        className: 'Object',
                        description: 'Object',
                        objectId: JSON.stringify({
                            level: i,
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
                        const s = data.stacks[0];
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
        const tv = new Tabson(data.value, props);
        const result = tv.props();
        const resp = {id: data.parrot.id, result};
        console.log(resp);
        this.sendFrontend(resp);
    }

    stackWatch = async (data) => {
        const valueType = typeof data.value;
        let valueFeild;
        if (valueType === 'object') {
            valueFeild = {
                description: 'Table',
                type: 'string',
                value: JSON.stringify(data.value, null, 4),
            };
        } else {
            let desc;
            if (data.value === undefined) {
                desc = 'nil';
            } else {
                desc = String(data.value);
            }
            valueFeild = {
                description: desc,
                type: valueType,
                value: data.value,
            };
        }
        const result = {result: valueFeild};
        if (data.error) {
            result.exceptionDetails = {
                columnNumber: 0,
                lineNumber: 0,
                text: String(data.value),
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
        const tv = new Tabson(data.value, props);
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
        console.log(resp);
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
