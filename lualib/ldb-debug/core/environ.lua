local rdebug = require 'remotedebug'
local class = require('ldb-debug/utils/oo').class

local function print_frame(frame, event)
    local fmt = 'frame> %-10s  %25s:%-2d  %3s:%s:%-15s'
    print(fmt:format(event, frame.source, frame.currentline,
                     frame.what, frame.namewhat, frame.name))
end

local function print_step(step)
    local fmt = 'step> %-10s  %25s:%-2d  %3s:%-15s  %s'
    print(fmt:format(step.event, step.file, step.line,
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

local function get_locals_array(level)
    local items = {}
    local i

    -- 似乎 C 函数，参数会多一个奇怪的 userdata
    -- 例如 print(1, 2})，在 i 为正数时
    -- name 总是 (*temporary)
    -- value 依次是 1, 2, userdata, nil
    -- 而且内存地址总是一样的
    -- 最后要根据这个标志移除掉
    local is_c_func = false

    i = 1
    while true do
        local name, value = rdebug.getlocal(level, i)
        if name == nil then
            if is_c_func then
                table.remove(items)
            end
            break
        end
        is_c_func = name == '(*temporary)'
        table.insert(items, expand_value(value))
        i = i + 1
    end

    i = -1
    while true do
        local name, value = rdebug.getlocal(level, i)
        if name == nil then
            break
        end
        table.insert(items, expand_value(value))
        i = i - 1
    end

    return items
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

    get_locals_array= function(self, level)
        local value = self.locals_array_cache[level]
        if value ~= nil then
            return value or nil
        end

        value = get_locals_array(level)
        self.locals_array_cache[value] = value or false
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
            --print_step(step)

            for _, hook in ipairs(hooks) do
                hook(step, session, environ)
            end

            while session.behavior.pausing do
                session:wait_frontend(0.1)
            end
        end)

        rdebug.hookmask(mask)
    end
})

return {
    Environ= Environ,
}
