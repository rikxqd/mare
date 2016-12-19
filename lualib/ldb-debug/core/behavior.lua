local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local libbp = require('ldb-debug/core/breakpoint')

local LineBreakPoint = libbp.LineBreakPoint
local ProbeBreakPoint = libbp.ProbeBreakPoint
local logger = Logger:new('Behavior')

local keymaker = {

    line= function(args)
        return string.format('line:%s:%d', args.file, args.line)
    end,

    probe= function(args)
        return string.format('probe:%s', args.name)
    end,
}

local Behavior = class({

    constructor= function(self)
        self.project_config = {
            break_on_enter= false,
            snapshot_limit_level= 5,
        }
        self.blackbox_files = {}
        self.breakpoints = {}
    end,

    match_blackbox_file= function(self, info)
        for _, v in iparis(self.blackbox_files) do
            if info.source == v then
                return true
            end
        end
        return false
    end,

    match_breakpoint= function(self, event, info)
        for _, v in pairs(self.breakpoints) do
            if v:match_event(event, info) then
                return true
            end
        end
        return false
    end,

    update_breakpoints= function(self, items)
        local breakpoints = {}
        for i, v in ipairs(items) do
            local key, breakpoint
            if v.type == 'line' then
                key = keymaker.line(v.args)
                breakpoint = LineBreakPoint:new(args)
            else
                key = keymaker.probe(v.args)
                breakpoint = ProbeBreakPoint:new(args)
            end
            breakpoints[key] = breakpoint
        end
        self.breakpoints = breakpoints
    end,

    update_blackbox_files= function(self, value)
        self.blackbox_files = value
    end,

    update_project_config= function(self, value)
        self.project_config = value
    end,

})

return {
    Behavior= Behavior,
}
