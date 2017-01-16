local lo = require('ldb/utils/lodash')
local rdebug = require('remotedebug')
local tabson = require('ldb/utils/tabson')

local p = function(v)
    if not session then
        return
    end
    local value = tabson.dump({
        'DEBUG',
        tostring(v),
        rdebug.type(v),
        rdebug.value(v),
    })
    value.vmtype = 'debug'
    session.frontend:console_api(value, 'log', {});
end

local function expand_value(value, cache)

    -- 基本类型，自身就是值
    if type(value) ~= 'userdata' then
        return value
    end

    -- 非基本类型，rdebug.value() 返回一个表示地址的字符串
    -- 相当于在 host vm 里 tostring()
    local orig_address = rdebug.value(value)

    -- 避免递归，从缓存取出已经展开过的
    local cache_key = orig_address
    local cache_value = cache[cache_key]
    if cache_value then
        return cache_value
    end

    local orig_type = rdebug.type(value)
    local mt = {
        __HOST_OBJ__ = true,
        __HOST_TYPE = orig_type,
        __HOST_TOSTRING__ = orig_address,
    }

    if orig_type == 'function' then
        mt.__HOST_INFO = rdebug.fvalue(value);
        local func = setmetatable({}, mt);
        cache[cache_key] = func
        return func
    end

    if orig_type == 'table' then
        local orig_mt = rdebug.getmetatable(value)
        if orig_mt then
            mt.__HOST_METATABLE__ = expand_value(orig_mt, cache)
        end

        local tbl = setmetatable({}, mt);
        cache[cache_key] = tbl

        local next_key, next_value
        while true do
            next_key, next_value = rdebug.next(value, next_key)
            if next_key == nil then
                break
            end

            local expanded_next_key = expand_value(next_key, cache)
            tbl[expanded_next_key] = expand_value(next_value, cache)
        end

        return tbl
    end

    if orig_type == 'userdata' then
        local orig_mt = rdebug.getmetatable(value)
        if orig_mt then
            mt.__HOST_METATABLE__ = expand_value(orig_mt, cache)
        end
        local tbl = setmetatable({}, mt);
        return tbl
    end

    if orig_type == 'thread' then
        mt.__HOST_INFO = {
            status = rdebug.fvalue(value),
        }
        local tbl = setmetatable({}, mt);
        return tbl
    end

    return nil
end

local expand_to_array = function(items)
    local cache = {}
    local ret = {}
    for _, item in ipairs(items) do
        local value = expand_value(item[2], cache)
        table.insert(ret, value)
    end
    return ret
end

local expand_to_dict = function(items)
    local cache = {}
    local ret = {}
    local temporaries = {}
    local varargs = {}
    local retargs = {}

    for _, item in ipairs(items) do
        local name = item[1]
        local value = expand_value(item[2], cache)

        if name == '(*temporary)' then
            table.insert(temporaries, value)
        elseif name == '(*vararg)' then
            table.insert(varargs, value)
        elseif name == '(*retarg)' then
            table.insert(retargs, value)
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
    if #retargs > 0 then
        ret['(*retarg)'] = retargs
    end

    return ret
end

return {
    expand_to_array = expand_to_array,
    expand_to_dict = expand_to_dict,
}
