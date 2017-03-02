local rdebug = require('remotedebug')

local function expand_value(value, cache)

    -- 基本类型，自身就是值
    if type(value) ~= 'userdata' then
        return value
    end

    -- 非基本类型，rdebug.value() 返回一个表示地址的字符串
    -- 相当于在 host vm 里 tostring()
    local host_value = rdebug.value(value)
    if type(host_value) ~= 'string' then
        return nil
    end
    local orig_address = host_value:sub(2, -2)

    -- 避免递归，从缓存取出已经展开过的
    local cache_key = orig_address
    local cache_value = cache[cache_key]
    if cache_value then
        return cache_value
    end

    local orig_type = rdebug.type(value)
    local mt = {
        __HOST_OBJ__ = true,
        __HOST_TYPE__ = orig_type,
        __HOST_TOSTRING__ = orig_address,
    }

    if orig_type == 'function' then
        local info = rdebug.props(value);
        if info.pointer_address then
            mt.__HOST_INFO_NATIVE__ = true
            mt.__HOST_INFO_POINTER_ADDRESS__ = info.pointer_address
            mt.__HOST_INFO_SYMBOL_BASE__ = info.symbol_base
            mt.__HOST_INFO_SYMBOL_FILE__ = info.symbol_file
        else
            mt.__HOST_INFO_NATIVE__ = false
            mt.__HOST_INFO_FILE__ = info.source
            mt.__HOST_INFO_LINE_BEGIN__ = info.linedefined
            mt.__HOST_INFO_LINE_END__ = info.lastlinedefined
        end
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
        mt.__HOST_INFO_STATUS__ = rdebug.props(value)
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
    local temporary_count = 0
    local temporary_dict = {}
    local vararg_count = 0
    local vararg_dict = {}
    local retarg_count = 0
    local retarg_dict = {}

    for _, item in ipairs(items) do
        local name = item[1]
        local value = expand_value(item[2], cache)

        if name == '(*temporary)' then
            temporary_count = temporary_count + 1
            temporary_dict[temporary_count] = value
        elseif name == '(*vararg)' then
            vararg_count = vararg_count + 1
            vararg_dict[vararg_count] = value
        elseif name == '(*retarg)' then
            retarg_count = retarg_count + 1
            retarg_dict[retarg_count] = value
        else
            ret[name] = value
        end
    end

    if temporary_count > 0 then
        local mt = {
            __HOST_OBJ__ = true,
            __HOST_TYPE__ = 'table',
            __HOST_TOSTRING__ = '(*temporary)',
        }
        setmetatable(temporary_dict, mt)
        ret['(*temporary)'] = temporary_dict
    end
    if vararg_count > 0 then
        local mt = {
            __HOST_OBJ__ = true,
            __HOST_TYPE__ = 'table',
            __HOST_TOSTRING__ = '(*vararg)',
        }
        setmetatable(vararg_dict, mt)
        ret['(*vararg)'] = vararg_dict
    end
    if retarg_count > 0 then
        local mt = {
            __HOST_OBJ__ = true,
            __HOST_TYPE__ = 'table',
            __HOST_TOSTRING__ = '(*retarg)',
        }
        setmetatable(retarg_dict, mt)
        ret['(*retarg)'] = retarg_dict
    end

    return ret
end

return {
    expand_to_array = expand_to_array,
    expand_to_dict = expand_to_dict,
}
