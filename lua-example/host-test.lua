rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

main = function(...)
    local value_dict = {x=1, y=2, z=3}
    local value_array = {'one', 'two', 'three'}
    local k = {...}
    local ttt = function()
        local b = {x=1, y={'a', {w=1}, e={value_array, value_dict}}};
        local c = {k=k}
        debugger.pause()
    end
    ttt()
    print(1)
end

print('hello, world');
main('eee', 'wwww')
