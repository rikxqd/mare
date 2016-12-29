local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local BreakPoint = require('ldb-debug/core/breakpoint').BreakPoint

local logger = Logger:new('Behavior')

local Behavior = class({

    constructor = function(self)
        self.blackboxes = {}
        self.breakpoints = {}
        self.movement = nil
        self.pausing_stacks = nil
        self.scope_queue = {}
    end,

    match_blackbox = function(self, step)
        for _, file in ipairs(self.blackboxes) do
            if step.file == file then
                return file
            end
        end
        return nil
    end,

    match_breakpoint = function(self, step)
        for _, breakpoint in ipairs(self.breakpoints) do
            if breakpoint:match(step) then
                return breakpoint
            end
        end
        return nil
    end,

    match_exception = function(self, step)
        local is_c_return = step.event == 'return' and step.scope == 'c'
        local is_metamethod = step.func:find('__', 1, true) == 1
        return is_c_return and is_metamethod
    end,

    match_movement = function(self, step)
        if step.event == 'line' and self.movement == 'over' then
            return self.movement
        end

        return nil
    end,

    set_blackboxes = function(self, value)
        self.blackboxes = value
    end,

    set_breakpoints = function(self, urls)
        local breakpoints = {}
        for _, url in ipairs(urls) do
            table.insert(breakpoints, BreakPoint:new(url))
        end
        self.breakpoints = breakpoints
    end,

    set_movement = function(self, value)
        self.movement = value
    end,

    consume_movement = function(self)
        self.movement = nil
    end,

    execute_pause = function(self, stacks)
        self.pausing_stacks = stacks
    end,

    execute_resume = function(self)
        self.pausing_stacks = nil
    end,

    is_pausing = function(self)
        return self.pausing_stacks ~= nil
    end,

    query_scope = function(self, value)
        table.insert(self.scope_queue, value)
    end,
})

return {
    Behavior = Behavior,
}
