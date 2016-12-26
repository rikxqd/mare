local class = require('ldb-debug/utils/oo').class
local aux = require('ldb-debug/aux')

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

        local value = aux.get_frame(level)
        self.frame_cache[level] = value or false
        return value
    end,

    get_locals_array= function(self, level, event)
        local key = string.format('%s:%d', event, level)
        local value = self.locals_array_cache[key]
        if value ~= nil then
            return value or nil
        end

        value = aux.get_locals_array(level, event)
        self.locals_array_cache[key] = value or false
        return value
    end,

    get_locals_dict= function(self, level, event)
        local key = string.format('%s:%d', event, level)
        local value = self.locals_dict_cache[key]
        if value ~= nil then
            return value or nil
        end

        value = aux.get_locals_dict(level, event)
        self.locals_dict_cache[key] = value or false
        return value
    end,

    get_stack= function(self, level)
        local frame = self:get_frame(level)

        if frame == nil then
            return nil
        end
        if aux.is_c_inner_frame(frame) then
            return nil
        end

        local stack = aux.normalize_frame(frame)
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
        if aux.is_c_frame(frame) then
            local frame2 = self:get_frame(2)
            step = aux.normalize_frame(frame2)
            step.func = frame.name
            step.scope = 'c'
        else
            step = aux.normalize_frame(frame)
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
})

return {
    Environ= Environ,
}
