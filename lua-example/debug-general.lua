local rdebug = require('remotedebug')
local IOStream = require('ldb/iostream/lsocket')
local factory = require('ldb/debugvm/factory')

local config = factory.start_args[2] or {}

local debugger = factory.standard(IOStream, {
    iostream = {
        host = '127.0.0.1',
        port = 8083,
    },
    session = {
        id = 'general',
        args = {
            title = config.title,
            expire = -1,
        },
    },
    pause_on_start = config.pause,
});

rdebug.hookmask(debugger.mask())
rdebug.sethook(function(event, line) 
    debugger.hook(event, line)
    rdebug.hookmask(debugger.mask())
end);

if config.start ~= false then
    debugger.start()
end
