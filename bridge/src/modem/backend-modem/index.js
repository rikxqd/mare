import EventEmitter from 'events';
import uuid from 'node-uuid';
import crypto from 'crypto';

export class BackendModem extends EventEmitter {

    constructor() {
        super();
        this.nonFileScriptIdCount = 0;
    }

    sendFrontend(value) {
        this.emit('send-frontend', value);
    }

    sendBackend(value) {
        this.emit('send-backend', value);
    }

    deliver = async (msg, store) => {
        if (msg.method === 'consoleApi') {
            this.printLogging(msg.params, store);
        }
        if (msg.method === 'consoleTable') {
            this.consoleTable(msg.params, store);
        }
    }

    printLogging  = async (data, store) => {
        const project = store.project;

        const stacks = data.stacks || [];
        const frames = stacks.map((s) => {
            let scriptId, url;
            if (s.file === '=stdin') {
                this.nonFileScriptParsed(data);
                scriptId = `${this.nonFileScriptIdCount}-stdin`;
                url = '';
            } else {
                scriptId = s.file.replace('@', '');
                scriptId = scriptId.replace('./', '');
                url = `${project.id}/${scriptId}`;
            }

            return {
                columnNumber: 0,
                functionName: s.func,
                lineNumber: s.line - 1,  // lua 从 1 开始
                scriptId: scriptId,
                url: url,
            };
        });

        const argsField = [];
        const keyLength = Object.keys(data.value).length;
        for (let i = 1; i <= keyLength; i++) {
            const key = `[${i}]`;
            const value = data.value[key];
            const valueType = typeof value;
            if (valueType === 'object') {
                const objectId = JSON.stringify({
                    root: uuid.v4(),
                    path: [],
                });
                store.jsobjAppendOne(objectId, value);
                argsField.push({
                    description: 'Table',
                    objectId: objectId,
                    type: 'object',
                });
            } else {
                argsField.push({
                    description: String(value),
                    type: valueType,
                    value: value,
                });
            }
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

    consoleLogging = async (data, store) => {
        const resp = {
            method: 'Log.entryAdded',
            params: {
                entry: {
                    source: 'abcd',
                    level: 'log',
                    text: JSON.stringify(data, null, 4),
                    timestamp: new Date().getTime(),
                },
            },
        };
        store.eventAppendOne(resp);
        this.sendFrontend(resp);
    }

    consoleTable  = async (data, store) => {
        const objectId = JSON.stringify({
            root: uuid.v4(),
            path: [],
        });
        const resp = {
            method: 'Runtime.consoleAPICalled',
            params: {
                args: [
                    {
                        description: 'Table',
                        objectId: objectId,
                        type: 'object',
                    },
                ],
                executionContextId: 1,
                stackTrace: {
                    callFrames: [],
                },
                timestamp: new Date().getTime(),
                type: data.type,
            },
        };
        store.eventAppendOne(resp);
        store.jsobjAppendOne(objectId, data);
        this.sendFrontend(resp);
    }
}
