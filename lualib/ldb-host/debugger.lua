local rdebug = require('remotedebug')

local debugger = {}

function debugger.idling(...)
    rdebug.probe('$debugger.idling', ...)
end

function debugger.reconnect(...)
    rdebug.probe('$debugger.reconnect', ...)
end

function debugger.behavior(...)
    rdebug.probe('$debugger.behavior', ...)
end

return debugger;
