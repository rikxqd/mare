local rdebug = require('remotedebug')

local debugger = {}

function debugger.idling(...)
    rdebug.probe('$debugger.idling', ...)
end

function debugger.breakpoints(...)
    rdebug.probe('$debugger.breakpoints', ...)
end

return debugger;
