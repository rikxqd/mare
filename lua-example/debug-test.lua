local rdebug = require('remotedebug')
local IOStream = require('mare/common/lsocket').IOStream
local Debugger = require('mare/debugvm/debugger').Debugger

local config = Debugger.get_host_args()[2] or {}

local debugger = Debugger:new({
    iostream = {
        host = '127.0.0.1',
        port = 8083,
    },
    session = {
        id = 'test',
        args = {
            title = config.title,
            expire = -1,
        },
    },
    pause_on_start = config.pause,
}, IOStream)

rdebug.hookmask(debugger.mask)
rdebug.sethook(function(event, line)
    debugger:hook(event, line)
    rdebug.hookmask(debugger.mask)
end)

if config.start ~= false then
    debugger:start()
end
