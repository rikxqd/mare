const TYPE_SPECIAL = 0;
const TYPE_PRIMITIVE = 1;
const TYPE_REFERENCE = 2;


const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

const typeAlias = {
    table: 'object',
    function: 'function',
    userdata: 'object',
    thread: 'object',
};

export class TabsonView {

    constructor(props, tabson) {
        this.props = props;
        this.tabson = tabson;
    }

    getObjectid(keys) {
        let obj;
        if (keys) {
            obj = Object.assign({}, {keys}, this.props);
        } else {
            obj = this.props;
        }
        return JSON.stringify(obj);
    }

    leafToVal(leaf) {
        const refs = this.tabson.refs;
        const {t, v} = leaf;

        if (t === TYPE_SPECIAL) {
            return {
                type: 'string',
                value: v,
            };
        }

        if (t === TYPE_PRIMITIVE) {
            const type = typeof v;
            return {
                type: type,
                value: v,
            };
        }

        if (t === TYPE_REFERENCE) {
            const ref = refs[v];
            const type = typeAlias[ref.type];
            const desc = capitalize(ref.type);
            return {type, desc};
        }
    }

    queryChild(parent, keys) {
        const refs = this.tabson.refs;
        let ref = refs[parent.v];
        let leaf;
        for (const key of keys) {
            const isStringKey = key[0] === '"';
            const item = ref.items.find((item) => {
                const keyLeaf = item.key;
                if (keyLeaf.t === TYPE_PRIMITIVE) {
                    if (isStringKey) {
                        return keyLeaf.v === JSON.parse(key);
                    } else {
                        return String(keyLeaf.v) === key;
                    }
                } else if (keyLeaf.t === TYPE_REFERENCE) {
                    return keyLeaf.v === key;
                } else {
                    return false;
                }
            });

            leaf = item.value;
            if (leaf.t !== TYPE_REFERENCE) {
                break;
            }
            const nextRef = refs[leaf.v];
            if (nextRef.type !== 'table') {
                break;
            }
            ref = nextRef;
        }
        return leaf;
    }

    findLeaf(keys) {
        const root = this.tabson.root;
        let leaf;
        if (keys) {
            leaf = this.queryChild(root, keys);
        } else {
            leaf = root;
        }
        return leaf;
    }

    query(keys) {
        const leaf = this.findLeaf(keys);
        const val = this.leafToVal(leaf);
        val.objectId = this.getObjectid(keys);
        return val;
    }

    attrs(keys) {
        const leaf = this.findLeaf(keys);
        const ref = this.tabson.refs[leaf.v];
        if (ref.type !== 'table') {
            return [];
        }

        const props = [];
        for (const item of ref.items) {
            const prop = {
                configurable: false,
                enumerable: true,
                isOwn: true,
                writable: false,
            };
            if (item.key.t === TYPE_PRIMITIVE) {
                if (typeof item.key.v === 'string') {
                    prop.name = `"${item.key.v}"`;
                } else {
                    prop.name = String(item.key.v);
                }
            } else {
                prop.name = item.key.v;
            }
            const val = this.leafToVal(item.value);
            if (keys) {
                val.objectId = this.getObjectid([...keys, prop.name]);
            } else {
                val.objectId = this.getObjectid();
            }
            prop.value = val;
            props.push(prop);
        }
        return props;
    }
}
