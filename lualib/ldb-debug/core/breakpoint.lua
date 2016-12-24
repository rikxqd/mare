local class = require('ldb-debug/utils/oo').class
local libstr = require('ldb-debug/utils/string')

local BreakPoint = class({

    constructor= function(self, url)
        self.url = url
        self.event = nil
        self.file = nil
        self.line = nil
        self.func = nil
        self.scope = nil
        self.name = nil
        self:parse_url()
    end,

    parse_url= function(self)
        local parts = libstr.split(self.url, ':')
        local event = parts[1]
        self.event = event

        if event == 'line' then
            self.file = parts[2]
            self.line = tonumber(parts[3])
            return
        end

        if event == 'call' then
            self.file = parts[2]
            self.func = parts[3]
            return
        end

        if event == 'return' then
            self.file = parts[2]
            self.func = parts[3]
            return
        end

        if event == 'probe' then
            self.name = parts[2]
            return
        end

    end,

    match_line= function(self, step)
        if step.event ~= 'line' then
            return false
        end

        local same_file = step.file == self.file
        local same_line = step.line == self.line
        return same_file and same_line
    end,

    match_call= function(self, step)
        if step.event ~= 'call' then
            return false
        end

        local same_file = step.file == self.file
        local same_func = step.func == self.func
        local same_scope = step.scope == self.scope
        return same_file and same_func and same_scope
    end,

    match_return= function(self, step)
        if step.event ~= 'return' then
            return false
        end

        local same_file = step.file == self.file
        local same_func = step.func == self.func
        local same_scope = step.scope == self.scope
        return same_file and same_func and same_scope
    end,

    match_probe = function(self, step)
        if step.event ~= 'probe' then
            return false
        end

        local same_name = frame.source == self.name
        return same_name
    end,

    match= function(self, step)
        local funcs = {
            self.match_line,
            self.match_call,
            self.match_return,
            self.match_probe,
        }

        for _, func in ipairs(funcs) do
            if func(self, step) then
                return true
            end
        end

        return false
    end

})

return {
    BreakPoint= BreakPoint,
}
