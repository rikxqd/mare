local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local BreakPoint = require('ldb-debug/core/breakpoint').BreakPoint

local logger = Logger:new('Behavior')

local Behavior = class({

    constructor= function(self)
        self.project = {
            break_on_enter= false,
            snapshot_limit_level= 5,
        }
        self.blackboxes = {}
        self.breakpoints = {}
    end,

    match_blackbox= function(self, frame)
        for _, v in iparis(self.blackboxes) do
            if frame.source == v then
                return true
            end
        end
        return false
    end,

    match_breakpoint= function(self, event, frame)
        for _, v in pairs(self.breakpoints) do
            if v:match_event(event, frame) then
                return true
            end
        end
        return false
    end,

    set_breakpoints= function(self, urls)
        local breakpoints = {}
        for i, v in ipairs(urls) do
            breakpoints[url] = BreakPoint:new(url)
        end
        self.breakpoints = breakpoints
    end,

    set_blackboxes= function(self, value)
        self.blackboxes = value
    end,

    set_project= function(self, value)
        self.project = value
    end,

})

return {
    Behavior= Behavior,
}
