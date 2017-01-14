import * as cnt from './constant';
import previewer from './previewer';

const printableString = (bytes) => {
    const buffer = Buffer.from(bytes, 'binary');
    const utf8String = buffer.toString('utf-8');
    if (!utf8String.includes('\ufffd')) {
        return utf8String;
    }
    const hexString = buffer.toString('hex');
    const escapeString = hexString.replace(/(..)/g, '\\x$1');
    return escapeString;
};

const fetchFunctionSource = (ref) => {
    if (ref.native) {
        return 'function() [native code] end';
    }
    // TODO 从文件截取
    const code = `${ref.file}:${ref.line_begin},${ref.line_end}`;
    return `function()\n${code}\nend`;
};

const isArrayLikeTable = (ref) => {
    const items = ref.items;
    const length = items.length;
    for (let i = 0; i < length; i++) {
        const {tag, arg} = items[i].key;
        if (tag !== cnt.TAG_LITERAL || arg !== (i + 1)) {
            return false;
        }
    }
    return true;
};

const doTagSpecial = (arg) => {
    if (arg === 'inf') {
        return {
            description: 'inf',
            type: 'number',
            unserializableValue: 'Infinity',
        };
    }

    if (arg === '-inf') {
        return {
            description: '-inf',
            type: 'number',
            unserializableValue: '-Infinity',
        };
    }

    if (arg === 'nan') {
        return {
            description: 'nan',
            type: 'number',
            unserializableValue: 'NaN',
        };
    }
};

const doTagLiteral = (arg) => {
    const type = typeof arg;

    if (type === 'number') {
        return {
            description: String(arg),
            type: 'number',
            value: arg,
        };
    }

    if (type === 'boolean') {
        return {
            type: 'boolean',
            value: arg,
        };
    }

    if (type === 'undefined') {
        return {
            description: 'nil',
            type: 'undefined',
        };
    }

    if (type === 'string') {
        return {
            type: 'string',
            value: printableString(arg),
        };
    }
};

const doTagReference = (arg, refs, mkoid) => {
    const ref = refs[arg];
    const objectId = mkoid();
    const type = ref.type;

    if (type === 'function') {
        return {
            className: 'Function',
            description: fetchFunctionSource(ref),
            objectId: objectId,
            type: 'function',
        };
    }

    if (type === 'thread') {
        return {
            className: 'Object',
            description: 'Thread',
            objectId: objectId,
            preview: previewer.thread(ref, refs),
            type: 'object',
        };
    }

    if (type === 'userdata') {
        return {
            className: 'Object',
            description: 'Userdata',
            objectId: objectId,
            preview: previewer.userdata(ref, refs),
            type: 'object',
        };
    }

    if (type === 'table') {
        if (isArrayLikeTable(ref)) {
            return {
                className: 'Array',
                description: `Table[${ref.items.length}]`,
                objectId: objectId,
                preview: previewer.tableAsArray(ref, refs),
                subtype: 'array',
                type: 'object',
            };
        } else {
            return {
                className: 'Object',
                description: 'Table',
                objectId: objectId,
                preview: previewer.tableAsObject(ref, refs),
                type: 'object',
            };
        }
    }

};

const doTagLimitDepth = (arg) => {
    return {
        type: 'object',
        subtype: 'null',
        value: `serialize limit depth: "${arg}"`,
    };
};

const doTagLimitCount = (arg) => {
    return {
        type: 'object',
        subtype: 'null',
        value: `serialize limit count: "${arg}"`,
    };
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
