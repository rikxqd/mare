local fp = require('ldb-debug/utils/fp')
local rdebug = require('remotedebug')

local function expand_value(value)
    local type = rdebug.type(value)

    if type == 'function' then
        local address = rdebug.value(value)
        return fp.constant(address)
    end

    if type ~= 'table' then
        return value
    end

    local tbl = {}
    local next_key, next_value
    while true do
        next_key, next_value = rdebug.next(value, next_key)
        if next_key == nil then
            break
        end
        tbl[next_key] = expand_value(next_value)
    end
    return tbl
end

local expand_value_safe = function(name, value)
    if name == '_ENV' then
        return '[_ENV]'
    else
        return expand_value(value)
    end
end

local expand_to_array = function(items)
    local ret = {}
    for _, item in ipairs(items) do
        local name = item[1]
        local value = expand_value_safe(name, item[2])
        table.insert(ret, value)
    end
    return ret
end

local expand_to_dict = function(items)
    local ret = {}
    local temporaries = {}
    local varargs = {}

    for _, item in ipairs(items) do
        local name = item[1]
        local value = expand_value_safe(name, item[2])

        if name == '(*temporary)' then
            table.insert(temporaries, value)
        elseif name == '(*vararg)' then
            table.insert(varargs, value)
        else
            ret[name] = value
        end
    end

    if #temporaries > 0 then
        ret['(*temporary)'] = temporaries
    end
    if #varargs > 0 then
        ret['(*vararg)'] = varargs
    end

    return ret
end

return {
    expand_to_array= expand_to_array,
    expand_to_dict= expand_to_dict,
}
