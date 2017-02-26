const DOMDebugger = {};

DOMDebugger.setXHRBreakpoint = async (req, store, modem) => {
    const {url} = req.params;
    const breakpointId = url;
    const parts = url.split('@');
    let breakpoint;
    if (parts.length === 1) {
        breakpoint = {
            event: 'probe',
            name: parts[0],
        };
    } else {
        const event = parts[0];
        const props = parts[1].split(':');
        breakpoint = {event};
        if (event === 'line' || event === 'tailcall') {
            if (props.length !== 2) {
                return null;
            }
            breakpoint.file = `@${props[0]}`;
            breakpoint.line = parseInt(props[1]);
        } else if (event === 'call' || event === 'return') {
            if (props.length !== 3) {
                return null;
            }
            breakpoint.file = `@${props[0]}`;
            breakpoint.line = parseInt(props[1]);
            breakpoint.func = props[2];
        } else {
            breakpoint.name = parts[1];
        }
    }

    breakpoint.breakpointId = breakpointId;
    await store.breakpointAppendOne(breakpoint);
    modem.updateBreakpoints(store);
    return null;
};

DOMDebugger.removeXHRBreakpoint = async (req, store, modem) => {
    const breakpointId = req.params.url;
    await store.breakpointRemoveOne(breakpointId);
    modem.updateBreakpoints(store);
    return null;
};

export default DOMDebugger;
