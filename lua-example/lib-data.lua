local key_func = function()  return 'key_func' end
local key_inf = 1 / 0
local key_native = tonumber
local key_table = {x=1, y=2, z=3}
local key_thread = coroutine.create(function() return 'key_thread' end)
local key_userdata = io.stdin
local value_func = function() return 'value_func' end
local value_inf = -1 / 0
local value_nan = 0 / 0
local value_native = tostring
local value_table = {'one', 'two', 'three'}
local value_thread = coroutine.create(function() return 'value_thread' end)
local value_userdata = io.stdout

local variety = {
    ['1'] = 'string 1',
    literal = 'string literal',
    value_func = value_func,
    value_inf = value_inf,
    value_nan = value_nan,
    value_native = value_native,
    value_table = value_table,
    value_thread = value_thread,
    value_userdata = value_userdata,
    'number 1',
    [key_func] = tostring(key_func),
    [key_inf] = tostring(key_inf),
    [key_native] = tostring(key_native),
    [key_table] = tostring(key_table),
    [key_thread] = tostring(key_thread),
    [key_userdata] = tostring(key_userdata),
    [false] = 'boolean false',
    [true] = 'boolean true',
};

return {
    key_func = key_func,
    key_inf = key_inf,
    key_native = key_native,
    key_table = key_table,
    key_thread = key_thread,
    key_userdata = key_userdata,
    value_func = value_func,
    value_inf = value_inf,
    value_nan = value_nan,
    value_native = value_native,
    value_table = value_table,
    value_thread = value_thread,
    value_userdata = value_userdata,
    variety = variety,
}
