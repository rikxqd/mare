import * as cnt from './constant';

const PREVIEW_PROP_COUNT = 5;

const createProperty = (item, refs) => {
    const keyNode = item.key;
    const valueNode = item.value;

    const name = String(keyNode.arg);
    let type, subtype, value;
    if (valueNode.tag === cnt.TAG_REFERENCE) {
        const childRef = refs[valueNode.arg];
        type = childRef.type === 'function' ? 'function' : 'object';
        value = childRef.type;
    } else if (valueNode.tag === cnt.TAG_LITERAL) {
        type = typeof valueNode.arg;
        value = type === 'undefined' ? 'nil' : String(valueNode.arg);
    } else if (valueNode.tag === cnt.TAG_SPECIAL) {
        const isNum = ['inf', '-inf', 'nan'].includes(valueNode.arg);
        type = isNum ? 'number' : 'null';
        value = valueNode.arg;
    } else {
        type = 'object';
        subtype = 'null';
        value = valueNode.arg;
    }

    const property = {name, type, value};
    if (subtype) {
        property.subtype = subtype;
    }
    return property;
};

const previewer = {

    thread: (ref) => {
        const status = {
            name: 'status',
            type: 'string',
            value: ref.status,
        };
        return {
            description: 'Thread',
            overflow: false,
            properties: [status],
            type: 'object',
        };
    },

    userdata: (ref) => {
        const properties = [];
        if (ref.metatable) {
            const metatable = {
                name: 'metatable',
                type: 'object',
                value: 'table',
            };
            properties.push(metatable);
        }
        return {
            description: 'Userdata',
            overflow: false,
            properties: properties,
            type: 'object',
        };
    },

    tableAsArray: (ref, refs) => {
        const items = ref.items;
        const properties = [];
        for (let i = 0; i < PREVIEW_PROP_COUNT; i++) {
            const item = items[i];
            if (item === undefined) {
                break;
            }
            const property = createProperty(items[i], refs);
            property.name = String(i);
            properties.push(property);
        }

        return {
            description: 'Table',
            overflow: items.length > PREVIEW_PROP_COUNT,
            properties: properties,
            subtype: 'array',
            type: 'object',
        };
    },

    tableAsObject: (ref, refs) => {
        const items = ref.items || [];
        const properties = [];
        for (let i = 0; i < PREVIEW_PROP_COUNT; i++) {
            const item = items[i];
            if (item === undefined) {
                break;
            }
            const property = createProperty(items[i], refs);
            properties.push(property);
        }

        return {
            description: 'Table',
            overflow: items.length > PREVIEW_PROP_COUNT,
            properties: properties,
            type: 'object',
        };
    },

};

export default previewer;
