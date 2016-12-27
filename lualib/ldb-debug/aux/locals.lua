local rdebug = require('remotedebug')
local aux_common = require('ldb-debug/aux/common')

-- 看上去会混进一些 C 里局部变量，在这里处理掉
local filter_c_locals = function(items, event)
    if event == nil then
        return items
    end

    -- 会多一个不是手动传进去的 (*temporary) 的 userdata，不明觉厉
    if event == 'call' or event == 'tail call' then
        local i = #items
        while i >= 1 do
            local name = items[i][1]
            if name == '(*temporary)' then
                table.remove(items, i)
                break
            end
            i = i - 1
        end
        return items
    end

    -- event 为 line 时，(*temporary) 看上去是没意义的
    if event == 'line' then
        local filtered = {}
        for _, item in ipairs(items) do
            local name = item[1]
            if name ~= '(*temporary)' then
                table.insert(filtered, item)
            end
        end
        return filtered
    end

    return items
end

local get_locals_items = function(level)
    local items = {}
    local i

    i = 1
    while true do
        local name, value = rdebug.getlocal(level, i)
        if name == nil then
            break
        end
        table.insert(items, {name, value})
        i = i + 1
    end

    i = -1
    while true do
        local name, value = rdebug.getlocal(level, i)
        if name == nil then
            break
        end
        table.insert(items, {name, value})
        i = i - 1
    end

    return items
end

local get_locals_array = function(level, event)
    local items = get_locals_items(level)
    items = filter_c_locals(items, event)
    return aux_common.expand_to_array(items)
end

local get_locals_dict = function(level, event)
    local items = get_locals_items(level)
    items = filter_c_locals(items, event)
    return aux_common.expand_to_dict(items)
end

return {
    get_locals_array= get_locals_array,
    get_locals_dict= get_locals_dict,
}
