import * as cnt from './constant';
import nodevalue from './nodevalue';

const doTagSpecial = () => {
    return {result: []};
};

const doTagLiteral = () => {
    return {result: []};
};

const doTagReference = (arg, refs, mkoid) => {
    const ref = refs[arg];
    const type = ref.type;
    const internalProperties = [];

    if (!ref.id.startsWith('(*')) {
        internalProperties.push({
            name: 'rawtostring',
            value: {
                type: 'string',
                value: ref.id,
            },
        });
    }

    if (type === 'function') {
        internalProperties.push({
            name: 'domain',
            value: {
                type: 'string',
                value: ref.native ? 'c' : 'lua',
            },
        });
        if (ref.file) {
            internalProperties.push({
                name: 'source',
                value: {
                    description: 'Object',
                    subtype: 'internal#location',
                    type: 'object',
                    value: {
                        columnNumber: 0,
                        lineNumber: ref.line_begin - 1,
                        scriptId: ref.file,
                    },
                },
            });
        }
        return {result: [], internalProperties};
    }

    if (type === 'thread') {
        internalProperties.push({
            name: 'status',
            value: {
                type: 'string',
                value: ref.status,
            },
        });
        return {result: [], internalProperties};
    }

    let metatableProp = null;
    if (ref.metatable) {
        metatableProp = {
            name: 'metatable',
            value: nodevalue(ref.metatable, refs, (subPaths = []) => {
                return mkoid(['$metatable', ...subPaths]);
            }),
        };
    }

    if (type === 'userdata') {
        const result = [];
        if (metatableProp) {
            internalProperties.push(metatableProp);
        }
        return {result, internalProperties};
    }

    if (type === 'table') {
        const result = ref.items.map((item) => {
            const keyNode = item.key;
            const valueNode = item.value;

            const isStringKey = do {
                const {tag, arg} = keyNode;
                tag === cnt.TAG_LITERAL && typeof arg === 'string';
            };

            const prefix = isStringKey ? '@' : '#';
            const valuePath = `${prefix}${keyNode.arg}`;
            const prop = {
                configurable: false,
                enumerable: true,
                isOwn: true,
                writable: false,
                name: String(item.key.arg),
                value: nodevalue(valueNode, refs, (subPaths = []) => {
                    return mkoid([valuePath, ...subPaths]);
                }),
            };

            if (!isStringKey) {
                prop.symbol = nodevalue(keyNode, refs, (subPaths = []) => {
                    const keyPaths = ['$keystable', `@${keyNode.arg}`];
                    return mkoid([keyPaths, ...subPaths]);
                });
            }

            return prop;
        });

        if (metatableProp) {
            internalProperties.push(metatableProp);
        }
        if (ref.keystable) {
            internalProperties.push({
                name: 'keystable',
                value: nodevalue(ref.keystable, refs, (subPaths = []) => {
                    return mkoid(['$keystable', ...subPaths]);
                }),
            });
        }
        return {result, internalProperties};
    }

};

const doTagLimitDepth = (arg) => {
    const internalProperties = [
        {
            name: 'reason',
            value: {
                description: arg,
                type: 'object',
                subtype: 'null',
            },
        },
    ];
    return {result: [], internalProperties};
};

const doTagLimitCount = (arg) => {
    const internalProperties = [
        {
            name: 'reason',
            value: {
                description: arg,
                type: 'object',
                subtype: 'null',
            },
        },
    ];
    return {result: [], internalProperties};
};

export default (node, refs, mkoid) => {
    const {tag, arg} = node;

    if (tag === cnt.TAG_SPECIAL) {
        return doTagSpecial(arg);
    }

    if (tag === cnt.TAG_LITERAL) {
        return doTagLiteral(arg);
    }

    if (tag === cnt.TAG_REFERENCE) {
        return doTagReference(arg, refs, mkoid);
    }

    if (tag === cnt.TAG_LIMIT_DEPTH) {
        return doTagLimitDepth(arg);
    }

    if (tag === cnt.TAG_LIMIT_COUNT) {
        return doTagLimitCount(arg);
    }
};
