local _desc = function(a, b) return string.format('%s=%s', a, b) end

local _, cycle = pcall(function()
    local a = {'a'}
    local b = {a=a, 'b'}
    local c = {a=a, b=b, 'c'}
    local d = {c=c, 'd'}
    a.b = b
    setmetatable(c, a)
    setmetatable(d, {__index=d})
    return {a=a, b=b, c=c, d=d}
end)

local key_func_c = tonumber
local key_func_lua = function() return 'key_func_lua' end
local key_inf_neg = -1 / 0
local key_inf_pos = 1 / 0
local key_string_number = '1'
local key_table_array = {'one', 'two', 'threee'}
local key_table_dict = {x=1, y=2, z=3}
local key_table_mix = {'one', ['1']='ONE', 'two'}
local key_thread = coroutine.create(function() return 'key_thread' end)
local key_userdata = io.stdin

local value_func_c = tonumber
local value_func_lua = function() return 'value_func_lua' end
local value_inf_neg = -1 / 0
local value_inf_pos = 1 / 0
local value_nan = 0 / 0
local value_string_ascii = 'too young too simple, sometimes naive'
local value_string_binary = '\xCA\xFE\xBA\xBE'
local value_string_utf8 = '苟利国家生死以，岂因祸福避趋之'
local value_table_array = {'one', 'two', 'threee'}
local value_table_dict = {x=1, y=2, z=3}
local value_table_meta = setmetatable({a=1, n=2, z=3, [4]=4}, {__mode='k'})
local value_table_mix = {'one', ['1']='ONE', 'two'}
local value_thread = coroutine.create(function() return 'value_thread' end)
local value_userdata = io.stdin

local variety = {
    value_func_c = value_func_c,
    value_func_lua = value_func_lua,
    value_inf_neg = value_inf_neg,
    value_inf_pos = value_inf_pos,
    value_nan = value_nan,
    value_string_ascii = value_string_ascii,
    value_string_binary = value_string_binary,
    value_string_utf8 = value_string_utf8,
    value_table_array = value_table_array,
    value_table_dict = value_table_dict,
    value_table_meta = value_table_meta,
    value_table_mix = value_table_mix,
    value_thread = value_thread,
    value_userdata = value_userdata,
    _desc('key_auto', '[1]'),
    [key_func_c] = _desc('key_func_c', key_func_c),
    [key_func_lua] = _desc('key_func_lua', key_func_lua),
    [key_inf_neg] = _desc('key_inf_neg', key_inf_neg),
    [key_inf_pos] = _desc('key_inf_pos', key_inf_pos),
    [key_string_number] = _desc('key_string_number', key_string_number),
    [key_table_array] = _desc('key_table_array' ,key_table_array),
    [key_table_mix] = _desc('key_table_mix' ,key_table_mix),
    [key_thread] = _desc('key_thread', key_thread),
    [key_userdata] = _desc('key_userdata', key_userdata),
    [false] = _desc('false', false),
    [true] = _desc('true', true),
}

return {
    cycle = cycle,
    key_func_c = key_func_c,
    key_func_lua = key_func_lua,
    key_inf_neg = key_inf_neg,
    key_inf_pos = key_inf_pos,
    key_string_number = key_string_number,
    key_table_array = key_table_array,
    key_table_dict = key_table_dict,
    key_table_mix = key_table_mix,
    key_thread = key_thread,
    key_userdata = key_userdata,
    value_func_c = value_func_c,
    value_func_lua = value_func_lua,
    value_inf_neg = value_inf_neg,
    value_inf_pos = value_inf_pos,
    value_nan = value_nan,
    value_string_ascii = value_string_ascii,
    value_string_binary = value_string_binary,
    value_string_utf8 = value_string_utf8,
    value_table_array = value_table_array,
    value_table_dict = value_table_dict,
    value_table_meta = value_table_meta,
    value_table_mix = value_table_mix,
    value_thread = value_thread,
    value_userdata = value_userdata,
    variety = variety,
}
