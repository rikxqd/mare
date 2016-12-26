local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local BreakPoint = require('ldb-debug/core/breakpoint').BreakPoint

local logger = Logger:new('Behavior')

local Behavior = class({

    constructor= function(self)
        self.blackboxes = {}
        self.breakpoints = {}
        self.movement = nil
        self.pausing = false
        self.stack_locals_queue = {}
    end,

    match_blackbox= function(self, step)
        for _, file in ipairs(self.blackboxes) do
            if step.file == file then
                return file
            end
        end
        return nil
    end,

    match_breakpoint= function(self, step)
        for _, breakpoint in ipairs(self.breakpoints) do
            if breakpoint:match(step) then
                return breakpoint
            end
        end
        return nil
    end,

    match_movement= function(self, step)
        if step.event == 'call' and self.movement == 'into' then
            return self.movement
        end

        if step.event == 'return' and self.movement == 'out' then
            return self.movement
        end

        if step.event == 'line' and self.movement == 'over' then
            return self.movement
        end

        return nil
    end,

    set_blackboxes= function(self, value)
        self.blackboxes = value
    end,

    set_breakpoints= function(self, urls)
        local breakpoints = {}
        for _, url in ipairs(urls) do
            table.insert(breakpoints, BreakPoint:new(url))
        end
        self.breakpoints = breakpoints
    end,

    set_movement= function(self, value)
        self.movement = value
    end,

    reset_movement= function(self)
        self.movement = nil
    end,

    exec_resume= function(self)
        self.pausing = false
    end,

    exec_pause= function(self)
        self.pausing = true
    end,

    get_stack_locals= function(self, value)
        local key = tostring(value.id)
        self.stack_locals_queue[key] = value
    end,
})

return {
    Behavior= Behavior,
}
