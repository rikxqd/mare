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
                description: String(v),
            };
        }

        if (t === TYPE_PRIMITIVE) {
            const type = typeof v;
            const desc = v === undefined ? 'nil' : String(v);
            return {
                type: type,
                value: v,
                description: desc,
            };
        }

        if (t === TYPE_REFERENCE) {
            const ref = refs[v];
            const type = typeAlias[ref.type];
            const desc = capitalize(ref.type);
            return {type, description: desc, subtype: 'object'};
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
                        try {
                            return keyLeaf.v === JSON.parse(key.slice(1, -1));
                        } catch (e) {
                            return false;
                        }
                    }
                } else if (keyLeaf.t === TYPE_REFERENCE) {
                    return keyLeaf.v === key.slice(1, -1);
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
        if (val.type === 'object') {
            val.objectId = this.getObjectid(keys);
        }
        return val;
    }

    attr() {
        const prop = {
            configurable: false,
            enumerable: true,
            isOwn: true,
            writable: false,
        };
        let keyName;
        const root = this.tabson.root;
        if (root.t === TYPE_PRIMITIVE) {
            if (typeof root.v === 'string') {
                keyName = `"${root.v}"`;
                prop.name = root.v;
                prop.enumerable = true;
            } else {
                keyName = `[${String(root.v)}]`;
                prop.name = String(root.v);
                prop.enumerable = true;
            }
        } else {
            keyName = `[${String(root.v)}]`;
            prop.name = root.v;
            prop.enumerable = true;
        }
        const val = this.leafToVal(root);
        prop.value = val;
        if (val.type === 'object') {
            val.objectId = this.getObjectid([keyName]);
        }
        return prop;
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
            let keyName;
            if (item.key.t === TYPE_PRIMITIVE) {
                if (typeof item.key.v === 'string') {
                    keyName = `"${item.key.v}"`;
                    prop.name = item.key.v;
                    prop.enumerable = true;
                } else {
                    keyName = `[${String(item.key.v)}]`;
                    prop.name = String(item.key.v);
                    prop.enumerable = true;
                }
            } else {
                keyName = `[${String(item.key.v)}]`;
                prop.name = item.key.v;
                prop.enumerable = true;
            }
            const val = this.leafToVal(item.value);
            if (val.type === 'object') {
                if (keys) {
                    val.objectId = this.getObjectid([...keys, keyName]);
                } else {
                    val.objectId = this.getObjectid([keyName]);
                }
            }
            prop.value = val;
            if (keyName[0] === '[') {
                prop.symbol = this.leafToVal(item.key);
            }
            props.push(prop);
        }
        return props;
    }
}
