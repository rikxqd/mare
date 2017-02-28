import * as cnt from './constant';

const getInfo = (ref) => {
    const ret = {};
    for (const item of ref.items) {
        ret[item.key.arg] = item.value.arg;
    }
    return ret;
};

const rehost = (rawobj) => {
    const {root, refs} = rawobj;
    const newRefs = {};

    const newRoot = Object.assign({}, root);
    const updateRoot = root.tag === cnt.TAG_REFERENCE;
    const mapping = {};

    for (const [id, ref] of Object.entries(refs)) {
        // 没有 metatable 的就是 host 信息的 table
        if (!ref.metatable) {
            continue;
        }
        const info = getInfo(refs[ref.metatable.arg]);
        const newRefId = info.__HOST_TOSTRING__;
        const newRefType = info.__HOST_TYPE__;
        const newRef = {
            type: newRefType,
        };
        if (newRefType === 'function') {
            newRef.native = info.__HOST_INFO_NATIVE__;
            if (newRef.native) {
                newRef.pointer_address = info.__HOST_INFO_POINTER_ADDRESS__;
                newRef.symbol_base = info.__HOST_INFO_SYMBOL_BASE__;
                newRef.symbol_file = info.__HOST_INFO_SYMBOL_FILE__;
            } else {
                newRef.file = info.__HOST_INFO_FILE__;
                newRef.line_begin = info.__HOST_INFO_LINE_BEGIN__;
                newRef.line_end = info.__HOST_INFO_LINE_END__;
            }
        } else if (newRefType === 'thread') {
            newRef.status = info.__HOST_INFO_STATUS__;
        } else if (newRefType === 'userdata') {
            newRef.metatable = info.__HOST_METATABLE__;
        } else if (newRefType === 'table') {
            newRef.items = ref.items.map((item) => {
                // 复制副本，因为后面会修改
                const key = Object.assign({}, item.key);
                const value = Object.assign({}, item.value);
                return {key, value};
            });
            newRef.metatable = info.__HOST_METATABLE__;
        }

        if (updateRoot && root.arg === id) {
            newRoot.arg = newRefId;
        }

        newRefs[newRefId] = newRef;
        mapping[id] = newRefId;
    }

    for (const newRef of Object.values(newRefs)) {
        if (newRef.metatable) {
            newRef.metatable = {
                tag: cnt.TAG_REFERENCE,
                arg: mapping[newRef.metatable],
            };
        }
        if (newRef.items) {
            for (const item of newRef.items) {
                if (item.key.tag === cnt.TAG_REFERENCE) {
                    item.key.arg = mapping[item.key.arg];
                }
                if (item.value.tag === cnt.TAG_REFERENCE) {
                    item.value.arg = mapping[item.value.arg];
                }
            }
        }
    }

    return {root: newRoot, refs: newRefs};
};

export default rehost;
