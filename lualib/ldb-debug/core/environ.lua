local rdebug = require 'remotedebug'
local class = require('ldb-debug/utils/oo').class

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

local function get_locals_dict(level)
end

local Environ = class({

    constructor= function(self)
        self.frame_cache = {}
        self.frames_cache = nil
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

    get_frames= function(self)
        if self.frames_cache ~= nil then
            return self.frames_cache or nil
        end

        local frames = {}
        local i = 1
        while true do
            local frame = self:get_frame(i)
            if frame == nil then
                break
            end

            local name = frame.name
            if name == nil and frame.what == 'C' then
                break
            end
            if name == nil and frame.what == 'main' then
                name = '(main)'
            end

            table.insert(frames, frame)
            i = i + 1
        end

        self.frames_cache = frames
        return frames
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

    get_locals_dict= function(self, level)
        local value = self.locals_dict_cache[level]
        if value ~= nil then
            return value or nil
        end

        value = get_locals_dict(level)
        self.locals_dict_cache[value] = value or false
        return value
    end,

    sethooks= function(cls, mask, hooks, frontend)
        rdebug.sethook(function(name, line)
            local environ = cls:new()
            local event = {name= name, line= line}
            for _, hook in ipairs(hooks) do
                hook(event, environ, frontend)
            end
        end)
        rdebug.hookmask(mask)
    end
})

return {
    Environ= Environ,
}
