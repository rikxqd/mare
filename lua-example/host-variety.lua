rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

key_func = function() end
key_table = {}
value_func = function() end
value_dict = {x=1, y=2, z=3}
value_array = {'one', 'two', 'three'}

variety = {
    'number 1',
    [2] = 'number 2',
    ['1'] = 'string 1',
    ['"quote"'] = 'string escaped',
    name = 'string literal',
    value_array = value_array,
    value_dict = value_dict,
    value_func = value_func,
    [key_func] = tostring(key_func),
    [key_table] = tostring(key_table),
    [false] = 'boolean false',
    [true] = 'boolean true',
};

main = function()
    local fmt = '%s = %s'
    print(fmt:format('key_func', key_func), key_func)
    print(fmt:format('key_table', key_table), key_table)
    print(fmt:format('value_func', value_func), value_func)
    print(fmt:format('value_dict', value_dict), value_dict)
    print(fmt:format('value_array', value_array, value_array))
    print(fmt:format('variety', variety), variety)
end

main()
