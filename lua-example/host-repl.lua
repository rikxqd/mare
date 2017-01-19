lsocket = require('lsocket')
rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

debugger.setopt('pretty_print', {mute=true, type='debug'})

sleep = function(s)
    lsocket.select(s / 1000)
end

main = function()
    local interval = 200
    local count = 0
    print('waiting for repl code, press Ctrl+C to exit')
    local value_dict = {x=1, y=2, z=3}
    local value_array = {'one', 'two', 'three'}
    while true do
        if count % 100 == 0 then
            --console.log('time %d count is', os.time(), count)
        end
        debugger.repl({debug_print=true})
        sleep(interval)
        count = count + 1
    end
end

main()
