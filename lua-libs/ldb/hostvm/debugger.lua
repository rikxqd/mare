local rdebug = require('remotedebug')

local debugger = {}

function debugger.idling(...)
    rdebug.probe('$debugger.idling', ...)
end

function debugger.start(...)
    rdebug.probe('$debugger.start', ...)
end

function debugger.stop(...)
    rdebug.probe('$debugger.stop', ...)
end

function debugger.restart(...)
    rdebug.probe('$debugger.restart', ...)
end

function debugger.keepalive(...)
    rdebug.probe('$debugger.keepalive', ...)
end

function debugger.setopt(...)
    rdebug.probe('$debugger.setopt', ...)
end

function debugger.repl(...)
    rdebug.probe('$debugger.repl', ...)
end

function debugger.print_behavior(...)
    rdebug.probe('$debugger.print_behavior', ...)
end

return debugger;
