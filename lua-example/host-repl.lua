rdebug = require('remotedebug')
console = require('ldb-host/console')
debugger = require('ldb-host/debugger')
lsocket = require('lsocket')
rdebug.start('debug-main')

sleep = function(s)
    lsocket.select(s / 1000)
end

loop = function()
    local count = 0
    while true do
        debugger.repl()
        sleep(200)
        count = count + 1
    end
end

loop()
