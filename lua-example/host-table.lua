rdebug = require('remotedebug')
console = require('ldb-host/console')
debugger = require('ldb-host/debugger')
rdebug.start('debug-main')

func_key = function() end
func_table = {}
tbl = {
    'number 1',
    [2] = 'number 2',
    ['1'] = 'string 1',
    callback = function() end,
    name = 'string name, be overrided',
    ['name'] = 'string name',
    point = {x=1, y=2, z=3},
    words = {'one', 'two', 'three'},
    [false] = 'boolean false',
    [true] = 'boolean true',
    [func_key] = tostring(func_key),
    [func_table] = tostring(func_table),
};

main = function()
    print(tbl)
end

main()
