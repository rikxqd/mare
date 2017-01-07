rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

lsocket = require('lsocket')

sleep = function(s)
    lsocket.select(s / 1000)
end

main = function()
    local interval = 200
    local count = 0
    while true do
        debugger.repl()
        sleep(interval)
        count = count + 1
    end
end

main()
