rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-test')

sleep = function(s)
    local lsocket = require('lsocket')
    lsocket.select(s / 1000)
end

printl = function(...)
    debugger.setopt('pretty_print', {mute=true})
    print(...)
    debugger.setopt('pretty_print', {mute=false})
end

main = function()
    local value_dict = {x=1, y=2, z=3}
    local value_array = {'one', 'two', 'three'}
    printl('Waiting for repl code, press Ctrl+C to exit')

    local interval = 200
    local count = 0
    while true do
        debugger.repl()
        sleep(interval)
        count = count + 1
    end
end

if (arg[-1] ~= '-i') then
    main()
end
