local rdebug = require 'remotedebug'
local class = require('ldb-debug/utils/oo').class

local function print_frame(frame, event)
    local fmt = 'frame> %-10s  %25s:%-2d  %3s:%s:%-15s'
    print(fmt:format(
    event, frame.source, frame.currentline,
    frame.what, frame.namewhat, frame.name))
end

local function print_step(step)
    local fmt = 'step> %-10s  %25s:%-2d  %3s:%-15s  %s'
    print(fmt:format(
    step.event, step.file, step.line,
    step.scope, step.func, step.name))
end

local function print_stack(stack)
    local fmt = 'stack> %-10s  %25s:%-2d  %15s'
    print(fmt:format(stack.event, stack.file, stack.line, stack.func))
end

local function expand_value(value)
    local type = rdebug.type(value)

    if type == 'function' then
        local address = rdebug.value(value)
        return address
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

local function expand_to_array(items)
    local ret = {}
    for _, item in ipairs(items) do
        local value = expand_value(item[2])
        table.insert(ret, value)
    end
    return ret
end

local function expand_to_dict(items)
    local ret = {}
    local temporaries = {}
    local varargs = {}
    for _, item in ipairs(items) do
        local name = item[1]
        local value = expand_value(item[2])
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

-- 看上去会混进一些 C 里局部变量，在这里处理掉
local function filter_c_locals(items, event)
    if event == nil then
        return items
    end

    -- 会多一个不是手动传进去的 (*temporary) 的 userdata，不明觉厉
    if event == 'call' then
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

local function get_locals_items(level)
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

local function get_locals_array(level, event)
    local items = get_locals_items(level)
    items = filter_c_locals(items, event)
    return expand_to_array(items)
end

local function get_locals_dict(level, event)
    local items = get_locals_items(level)
    items = filter_c_locals(items, event)
    return expand_to_dict(items)
end

local function is_c_inner_frame(frame)
    return frame.what == 'C' and frame.namewhat == ''
end

local function is_c_frame(frame)
    return frame.what == 'C' and frame.namewhat ~= ''
end

local function normalize_frame(frame)
    local name = frame.name
    if name == nil then
        if frame.what == 'main' then
            name = '(*main)'
        elseif frame.what == 'Lua' then
            name = '(*tailcall)'
        end
    end

    return {
        file= frame.source,
        line= frame.currentline,
        func= name,
    }
end

local Environ = class({

    constructor= function(self)
        self.frame_cache = {}
        self.locals_array_cache = {}
        self.locals_dict_cache = {}
    end,

    get_frame= function(self, level)
        local value = self.frame_cache[level]
        if value ~= nil then
            return value or nil
        end

        local value = rdebug.getinfo(level)
        self.frame_cache[level] = value or false
        return value
    end,

    get_locals_array= function(self, level, event)
        local key = string.format('%s:%d', event, level)
        local value = self.locals_array_cache[key]
        if value ~= nil then
            return value or nil
        end

        value = get_locals_array(level, event)
        self.locals_array_cache[key] = value or false
        return value
    end,

    get_locals_dict= function(self, level, event)
        local key = string.format('%s:%d', event, level)
        local value = self.locals_dict_cache[key]
        if value ~= nil then
            return value or nil
        end

        value = get_locals_dict(level, event)
        self.locals_dict_cache[key] = value or false
        return value
    end,

    get_stack= function(self, level)
        local frame = self:get_frame(level)

        if frame == nil then
            return nil
        end
        if is_c_inner_frame(frame) then
            return nil
        end

        local stack = normalize_frame(frame)
        return stack
    end,

    get_stacks= function(self)
        local stacks = {}
        local i = 1
        while true do
            local stack = self:get_stack(i)
            if stack == nil then
                break
            end
            table.insert(stacks, stack)
            i = i + 1
        end
        return stacks
    end,

    get_step= function(self, event)
        local frame = self:get_frame(1)
        local step
        if is_c_frame(frame) then
            local frame2 = self:get_frame(2)
            step = normalize_frame(frame2)
            step.func = frame.name
            step.scope = 'c'
        else
            step = normalize_frame(frame)
            step.scope = 'lua'
        end

        if event == 'line' or event == 'call'
            or event == 'tail call'
            or event == 'return' then
            step.event = event
        else
            step.event = 'probe'
            step.name = event
        end
        return step
    end,

    sethooks= function(cls, mask, hooks, session)

        rdebug.sethook(function(event, line)
            local environ = cls:new()
            local frame = environ:get_frame(1)
            --print_frame(frame, event)
            if is_c_inner_frame(frame) then
                return
            end

            local step = environ:get_step(event)
            print_step(step)
            for _, hook in ipairs(hooks) do
                hook(step, session, environ)
            end

            local behavior = session.behavior
            if behavior.pausing then
                print('pausing at')
                print_step(step)
            end
            while behavior.pausing do
                session:wait_frontend(0.1)
                for _, v in pairs(behavior.stack_locals_queue) do
                    v.value = environ:get_locals_dict(v.level, event)
                    session:stack_locals(v)
                end
                behavior.stack_locals_queue = {}
                if not behavior.pausing then
                    session:debugger_resumed()
                end
            end
        end)

        rdebug.hookmask(mask)
    end
})

return {
    Environ= Environ,
}
