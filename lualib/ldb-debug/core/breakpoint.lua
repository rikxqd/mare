local class = require('ldb-debug/utils/oo').class
local libstr = require('ldb-debug/utils/string')

local BreakPoint = class({

    constructor = function(self, url)
        self.url = url
        self.event = nil
        self.file = nil
        self.line = nil
        self.func = nil
        self.scope = nil
        self.name = nil
        self:parse_url()
    end,

    parse_url = function(self)
        local parts = libstr.split(self.url, ':')
        local event = parts[1]
        self.event = event

        if event == 'probe' then
            self.name = parts[2]
            return
        end

        self.file = parts[2]
        self.line = tonumber(parts[3])

        if event == 'line' or event == 'tailcall' then
            return
        end

        self.func = parts[4]
    end,

    match_line = function(self, step)
        if step.event ~= 'line' then
            return false
        end

        local same_file = step.file == self.file
        local same_line = step.line == self.line
        return same_file and same_line
    end,

    match_tailcall = function(self, step)
        if step.event ~= 'tailcall' then
            return false
        end

        local same_file = step.file == self.file
        local same_line = step.line == self.line
        return same_file and same_line
    end,

    match_call = function(self, step)
        if step.event ~= 'call' then
            return false
        end

        local same_file = step.file == self.file
        local same_line = step.line == self.line
        local same_func = step.func == self.func
        return same_file and same_line and same_func
    end,

    match_return = function(self, step)
        if step.event ~= 'return' then
            return false
        end

        local same_file = step.file == self.file
        local same_line = step.line == self.line
        local same_func = step.func == self.func
        return same_file and same_line and same_func
    end,

    match_probe = function(self, step)
        if step.event ~= 'probe' then
            return false
        end

        -- 以 $ 开头作内部用途，有特殊意义，忽略
        if step.name:find('$', 1, true) == 1 then
            return false
        end

        local same_name = step.name == self.name
        return same_name
    end,

    match = function(self, step)
        if step.event ~= self.event then
            return false
        end

        local funcs = {
            self.match_line,
            self.match_tailcall,
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
    BreakPoint = BreakPoint,
}
