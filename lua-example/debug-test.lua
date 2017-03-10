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
        local dir = '/path/to/script_folder'
        local builtin = 'chrome-devtools://devtools/bundled/inspector.html'
        local custom = 'http://127.0.0.1:8001/devtools/inspector.html'
        local ws_url = 'ws=127.0.0.1:9223/session/test'
        local fmt = '* %s?%s?project.source=%s'
        local url1 = fmt:format(builtin, ws_url, dir)
        local url2 = fmt:format(custom, ws_url, dir)
        print('[mare] You can debug this scirpt in Chrome:')
        print(url1)
        print(url2)
    else
        print('[mare] fail to connect server')
    end
end
