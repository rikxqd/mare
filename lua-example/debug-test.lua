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

    local ci = debugger.config.iostream
    local cs = debugger.config.session

    if debugger.session:is_ready() then
        local dir = os.getenv('PWD') or 'example'
        local path = 'http://%s:8001/devtools/inspector.html'
        local args = '?ws=%s:9223/session/%s?project.source=%s'
        local url = path:format(ci.host) .. args:format(ci.host, cs.id, dir)
        print('[mare] devtools url: ' .. url)
    else
        local server = string.format('%s:%s', ci.host, ci.port)
        print('[mare] fail to connect debugger server: ' .. server)
    end
end
