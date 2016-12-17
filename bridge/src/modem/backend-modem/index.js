import EventEmitter from 'events';
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
        if (msg.method === 'consolePrint') {
            this.printLogging(msg.params, store);
        }
        if (msg.method === 'consoleTable') {
            //this.consoleLogging(msg.params, store);
        }
    }

    printLogging  = async (data, store) => {
        const project = store.project;
        let scriptId, url;
        if (data.file === '=stdin') {
            this.nonFileScriptParsed(data);
            scriptId = `${this.nonFileScriptIdCount}-stdin`;
            url = '';
        } else {
            scriptId = data.file.replace('@', '');
            scriptId = scriptId.replace('./', '');
            url = `${project.id}/${scriptId}`;
        }
        const resp = {
            method: 'Runtime.consoleAPICalled',
            params: {
                args: [
                    {
                        type: 'string',
                        value: data.value,
                    },
                ],
                executionContextId: 1,
                stackTrace: {
                    callFrames: [
                        {
                            columnNumber: 0,
                            functionName: 'print',
                            lineNumber: data.line - 1,  // lua 从 1 开始
                            scriptId: scriptId,
                            url: url,
                        },
                    ],
                },
                timestamp: new Date().getTime(),
                type: 'log',
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

}
