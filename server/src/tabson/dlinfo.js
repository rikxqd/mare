import libpath from 'path';
import child_process from 'child_process';

const getAddr = (ref) => {
    const name = ref.symbol_file;
    if (name.endsWith('.so') || name.endsWith('.dll')) {
        const offset = Number(ref.pointer_address) - Number(ref.symbol_base);
        return offset.toString(16);
    } else {
        return ref.pointer_address.replace('0x', '');
    }
};

const parseAddr2Line = (text) => {
    const reg = /(.+?) at (.+):([\d?]+)/;
    const lines = text.trim().split('\n');
    const items = [];
    for (const line of lines) {
        let symbol_name = '';
        let source_file = '';
        let line_begin = 0;
        if (line.includes('?')) {
            items.push({symbol_name, source_file, line_begin});
            continue;
        }
        const match = line.match(reg);
        symbol_name = match[1];
        source_file = match[2];
        line_begin = parseInt(match[3]);
        items.push({symbol_name, source_file, line_begin});
    }
    return items;
};

const runCmd = ([cmd, path, addrs]) => {
    return new Promise((resolve) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            const info = {};
            if (!error && !stderr) {
                const items = parseAddr2Line(stdout);
                for (const [i, addr] of Object.entries(addrs)) {
                    info[`0x${addr}`] = items[i];
                }
            }
            resolve({path, info});
        });
    });
};

const dlinfo = async (refs, projectSource) => {
    refs = refs.filter((r) => r.symbol_file);
    const files = {};
    for (const ref of refs) {
        const path = libpath.resolve(projectSource, ref.symbol_file);
        let addrs = files[path];
        if (!addrs) {
            addrs = {};
            files[path] = addrs;
        }
        const addr = getAddr(ref);
        addrs[addr] = true;
        ref.symbol_address = `0x${addr}`;
    }

    const cmds = [];
    for (const [path, addrDict] of Object.entries(files)) {
        const addrs = Object.keys(addrDict);
        const args = addrs.join(' ');
        const cmd = `addr2line -pfe ${path} ${args}`;
        cmds.push([cmd, path, addrs]);
    }
    const items = await Promise.all(cmds.map(runCmd));
    const mapping = {};
    for (const item of items) {
        mapping[item.path] = item.info;
    }
    for (const ref of refs) {
        const path = libpath.resolve(projectSource, ref.symbol_file);
        const info = mapping[path];
        Object.assign(ref, info[ref.symbol_address]);
    }
};

export default dlinfo;
