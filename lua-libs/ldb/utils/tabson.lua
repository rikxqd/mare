local TYPE_SPECIAL = 0
local TYPE_PRIMITIVE = 1
local TYPE_REFERENCE = 2

local rawtostring = function(obj)
    local mt = getmetatable(obj)
    if not mt then
        return tostring(obj)
    end
    local func = mt.__tostring
    mt.__tostring = nil
    local str = tostring(obj)
    mt.__tostring = func
    return str
end

local rawpairs = function(tbl, func)
    local mt = getmetatable(tbl)
    setmetatable(tbl, nil)
    for k, v in pairs(tbl) do
        func(k, v)
    end
    setmetatable(tbl, mt)
end

local function dumpval(val, opt, mem, depth)
    local t = type(val)
    local tp = t == 'nil' or t == 'boolean' or t == 'number' or t == 'string'
    if tp then
        return {t=TYPE_PRIMITIVE, v=val}
    end

    if depth >= opt.max_depth then
        local desc = string.format('limit_depth: %s', val)
        return {t=TYPE_SPECIAL, v=desc}
    end

    if mem.count >= opt.max_count then
        local desc = string.format('limit_count: %s', val)
        return {t=TYPE_SPECIAL, v=desc}
    end

    mem.count = mem.count + 1
    depth = depth + 1

    local id = rawtostring(val)
    local ref = mem.refs[id]
    if ref then
        return ref
    end

    ref = {type=t}
    mem.refs[id] = ref
    local leaf = {t=TYPE_REFERENCE, v=id}

    if t == 'function' then
        local info = debug.getinfo(val, 'S')
        ref.native = info.what == 'C'
        if not ref.native then
            ref.file = info.source
            ref.line_begin = info.linedefined
            ref.line_end = info.lastlinedefined
        end
        return leaf
    end

    if t == 'thread' then
        local status = coroutine.status(val)
        ref.status = status
        return leaf
    end

    if t == 'userdata' then
        local metatable = getmetatable(t)
        if metatable then
            metatable = dumpval(metatable, opt, mem, depth)
        end
        ref.metatable = metatable
        return leaf
    end

    if t == 'table' then
        local items = {}
        rawpairs(val, function(k, v)
            local item = {
                key = dumpval(k, opt, mem, depth),
                value = dumpval(v, opt, mem, depth),
            }
            table.insert(items, item)
        end)

        local metatable = getmetatable(val)
        if metatable then
            metatable = dumpval(metatable, opt, mem, depth)
        end

        ref.items = items
        ref.metatable = metatable
        return leaf
    end

    mem.count = mem.count - 1
    local desc = string.format('unknow_type: %s', t)
    return {t=TYPE_SPECIAL, v=desc}
end

local dump = function(val, opt)
    opt = opt or {}
    opt.max_depth = opt.max_depth or 16
    opt.max_count = opt.max_count or 1024
    local mem = {refs={}, count=0}
    local root = dumpval(val, opt, mem, 0)
    return {
        root = root,
        refs = mem.refs,
        count = mem.count,
        option = opt,
    }
end

return {
    dump=dump,
}
