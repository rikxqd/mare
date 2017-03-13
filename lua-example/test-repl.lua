rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test')

sleep = function(s)
    if os.getenv('OS') == 'Windows_NT' then
        local cmd = string.format('ping -n %d localhost > NUL', s + 1)
        os.execute(cmd)
    else
        local lsocket = require('lsocket')
        lsocket.select(s)
    end
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

    local interval = 1
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
