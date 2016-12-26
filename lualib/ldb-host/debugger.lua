local rdebug = require('remotedebug')

local debugger = {}

function debugger.idling(...)
    rdebug.probe('debugger.idling', ...)
end

function debugger.reconnect(...)
    rdebug.probe('debugger.reconnect', ...)
end

function debugger.print_status(...)
    rdebug.probe('debugger.print_status', ...)
end

return debugger;
