local rdebug = require('remotedebug')
assert(rdebug.status == 'debugger');
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
    if debugger.session:is_ready() then
        local pwd = os.getenv('PWD')
        local url = string.format('chrome-devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9223/session/test?project.source=%s', pwd)
        print(string.format('[mare] 此入口文件 Chrome 地址调试\n%s', url))
    end
end
