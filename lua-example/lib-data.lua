local key_func = function()  return 'key_func' end
local key_table = {}
local key_userdata = io.stdin
local value_func = function() return 'value_func' end
local value_dict = {x=1, y=2, z=3}
local value_array = {'one', 'two', 'three'}
local value_userdata = io.stdout

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
    [key_func] = tostring(key_func),
    [key_table] = tostring(key_table),
    [key_userdata] = tostring(key_userdata),
    [false] = 'boolean false',
    [true] = 'boolean true',
};

return {
    key_func = key_func,
    key_table = key_table,
    key_userdata = key_userdata,
    value_func = value_func,
    value_dict = value_dict,
    value_array = value_array,
    value_userdata = value_userdata,
    variety = variety,
}
