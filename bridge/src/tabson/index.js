import * as cnt from './constant';
import nodevalue from './nodevalue';
import nodeprops from './nodeprops';

const parsePath = function(path) {
    const prefix = path[0];
    const code = path.slice(1);
    let isString = false;
    let isNumber = false;
    let isBoolean = false;
    let isReference = false;
    let isInternal = false;
    let isInvalid = false;

    if (prefix === '@') {
        isString = true;
    } else if (prefix === '#') {
        isNumber = !isNaN(code) || code === 'inf' || code === '-inf';
        isBoolean = (!isNumber) && (code === 'false' || code === 'true');
        isReference = !isNumber || isBoolean;
    } else if (prefix === '$') {
        isInternal = true;
    } else {
        isInvalid = true;
    }
    if (isInvalid) {
        return {code, isInvalid};
    }
    return {code, isString, isNumber, isBoolean, isReference, isInternal};
};

const findItem = function(parsedPath, ref) {
    const pp = parsedPath;
    const code = pp.code;
    return ref.items.find((item) => {
        const {tag, arg} = item.key;
        if (pp.isString) {
            return tag === cnt.TAG_LITERAL && code === arg;
        } else if (pp.isNumber || pp.isBoolean) {
            return tag === cnt.TAG_LITERAL && code === String(arg);
        } else if (pp.isReference) {
            return tag === cnt.TAG_REFERENCE && code === arg;
        } else {
            return false;
        }
    });
};

export class Tabson {

    constructor(rawobj, idmix) {
        this.rawobj = rawobj;
        this.idmix = idmix;
    }

    makeObjectId(paths = []) {
        let obj;
        if (paths.length === 0) {
            obj = this.idmix;
        } else {
            obj = Object.assign({}, this.idmix);
            obj.paths = paths;
        }
        return JSON.stringify(obj);
    }

    getNodeByParsedPaths(parsedPaths) {
        const {root, refs} = this.rawobj;
        let node = root;
        for (const pp of parsedPaths) {
            if (pp.isInvalid) {
                return null;
            }

            const ref = refs[node.arg];
            if (pp.isInternal) {
                node = ref[pp.code];
            } else {
                const item = findItem(pp, ref);
                node = item.value;
            }
        }
        return node;
    }

    getNode(paths = []) {
        const root = this.rawobj.root;
        if (paths.length === 0) {
            return root;
        }

        let node;
        try {
            const parsedPaths = paths.map(parsePath);
            node = this.getNodeByParsedPaths(parsedPaths);
        } catch (e) {
            console.error(e);
            node = null;
        }
        return node;
    }

    value(paths = []) {
        const node = this.getNode(paths);
        if (node === null) {
            return null;
        }
        const value = nodevalue(node, this.rawobj.refs, (subPaths = []) => {
            return this.makeObjectId([...paths, ...subPaths]);
        });
        return value;
    }

    props(paths = []) {
        const node = this.getNode(paths);
        if (node === null) {
            return null;
        }
        const props = nodeprops(node, this.rawobj.refs, (subPaths = []) => {
            return this.makeObjectId([...paths, ...subPaths]);
        });
        return props;
    }
}
