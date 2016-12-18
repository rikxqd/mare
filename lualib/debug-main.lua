local rdebug = require('remotedebug')
local Client = require('ldb-debug/client').Client
local Debugger = require('ldb-debug/debugger').Debugger
local handlers = require('ldb-debug/handlers')

client = Client:new({
    host= '127.0.0.1',
    port= 8083,
    session= 'abcde',
})
client:start()

rdebug.sethook(function(event, line)
    local debugger = Debugger:new()
    handlers.do_print(event, line, debugger, client)
    handlers.do_console(event, line, debugger, client)
end)
rdebug.hookmask('crl')

