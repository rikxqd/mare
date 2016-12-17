local rdebug = require 'remotedebug'

local exports = {}

function exports.log(...)
    rdebug.probe('$console-log', ...)
end

function exports.debug(...)
    rdebug.probe('$console-debug', ...)
end

function exports.info(...)
    rdebug.probe('$console-info', ...)
end

function exports.warn(...)
    rdebug.probe('$console-warning', ...)
end

function exports.error(...)
    rdebug.probe('$console-error', ...)
end

function exports.trace(...)
    rdebug.probe('$console-trace', ...)
end

function exports.assert(...)
    rdebug.probe('$console-assert', ...)
end

function exports.group(...)
    rdebug.probe('$console-startGroup', ...)
end

function exports.groupCollapsed(...)
    rdebug.probe('$console-startGroupCollapsed', ...)
end

function exports.groupEnd(...)
    rdebug.probe('$console-endGroup', ...)
end

function exports.clear(...)
    rdebug.probe('$console-clear', ...)
end

return exports;
