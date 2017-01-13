local key_func = function()  return 'key_func' end
local key_table = {}
local key_userdata = io.stdin
local key_thread = coroutine.create(function() end)
local value_func = function() return 'value_func' end
local value_dict = {x=1, y=2, z=3}
local value_array = {'one', 'two', 'three'}
local value_userdata = io.stdout
local value_thread = coroutine.create(function() end)

local variety = {
    'number 1',
    [2] = 'number 2',
    ['1'] = 'string 1',
    ['"quote"'] = 'string escaped',
    name = 'string literal',
    value_array = value_array,
    value_dict = value_dict,
    value_func = value_func,
    value_userdata = value_userdata,
    value_thread = value_thread,
    [key_func] = tostring(key_func),
    [key_table] = tostring(key_table),
    [key_userdata] = tostring(key_userdata),
    [key_thread] = tostring(key_thread),
    [false] = 'boolean false',
    [true] = 'boolean true',
};

return {
    key_func = key_func,
    key_table = key_table,
    key_userdata = key_userdata,
    key_thread = key_thread,
    value_func = value_func,
    value_dict = value_dict,
    value_array = value_array,
    value_userdata = value_userdata,
    value_thread = value_thread,
    variety = variety,
}
