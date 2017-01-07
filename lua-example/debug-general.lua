local rdebug = require('remotedebug')
local IOStream = require('ldb/iostream/lsocket')
local factory = require('ldb/debugvm/factory')

local debugger = factory.standard(IOStream, {
    iostream = {
        host = '127.0.0.1',
        port = 8083,
    },
    session = {
        id = 'general',
        args = {
            title = 'debug-general',
            expire = -1,
        },
    },
    pause_on_start = false,
});

rdebug.hookmask(debugger.mask())
rdebug.sethook(function(event, line) 
    debugger.hook(event, line)
    rdebug.hookmask(debugger.mask())
end);
debugger.start()
