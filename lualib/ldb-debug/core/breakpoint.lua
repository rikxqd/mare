local class = require('ldb-debug/utils/oo').class
local libstr = require('ldb-debug/utils/string')

local BreakPoint = class({

    constructor= function(self, url)
        self.url = url
        self.name = nil
        self.file = nil
        self.value = nil
        self.parse_url()
    end,

    parse_url= function(self)
        local parts = libstr.split(self.url)
        self.name = parts[1]
        self.file = parts[2]
        self.value = parts[3]
    end,

    match_line= function(self, event, frame)
        if event.name ~= 'line' then
            return false
        end
        local same_file = frame.source == self.file
        local same_line = event.line == self.value
        return same_file and same_line
    end,

    match_call= function(self, event, frame)
        if event.name ~= 'call' then
            return false
        end

        local same_file = frame.source == self.file
        local same_func = frame.name == self.value
        return same_file and same_func
    end,

    match_return= function(self, event, frame)
        if event.name ~= 'return' then
            return false
        end

        local same_file = frame.source == self.file
        local same_func = frame.name == self.value
        return same_file and same_func
    end,

    match_probe = function(self, event, frame)
        if event.name ~= self.name then
            return false
        end
        if self.file == nil then
            return true
        end
        local same_file = frame.source == self.file
        return same_file
    end,

    match= function(self, event, frame)
        if self.match_line(event, frame) then
            return true
        end
        if self.match_call(event, frame) then
            return true
        end
        if self.match_return(event, frame) then
            return true
        end
        if self.match_probe(event, frame) then
            return true
        end
        return false
    end

})

return {
    BreakPoint= BreakPoint,
}

