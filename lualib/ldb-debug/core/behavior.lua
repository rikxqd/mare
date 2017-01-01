local class = require('ldb-debug/utils/oo').class
local BreakPoint = require('ldb-debug/core/breakpoint').BreakPoint

local Behavior = class({

    constructor = function(self)
        self.skip_all = false
        self.skip_files = {}
        self.pause_breakpoints = {}
        self.pause_exception = nil
        self.pause_pace = nil
        self.pausing_stacks = nil
        self.scope_queue = {}
    end,

    match_skip_all = function(self)
        return self.skip_all
    end,

    match_skip_file = function(self, step)
        for _, file in ipairs(self.skip_files) do
            if step.file == file then
                return true, file
            end
        end
        return false, nil
    end,

    match_pause_breakpoint = function(self, step)
        for _, breakpoint in ipairs(self.pause_breakpoints) do
            if breakpoint:match(step) then
                return true, breakpoint.url
            end
        end
        return false, nil
    end,

    match_pause_exception = function(self, step)
        if self.pause_exception == nil then
            return false, nil
        end

        if self.pause_exception == 'all' then
            local is_c_return = step.event == 'return' and step.scope == 'c'
            local is_metamethod = step.func:find('__', 1, true) == 1
            local match = is_c_return and is_metamethod
            if match then
                return true, 'all'
            else
                return false, nil
            end
        end

        return false, nil
    end,

    match_pause_pace = function(self, step)
        if self.pause_pace == nil then
            return false, nil
        end

        -- 忽略 C 代码
        if step.scope == 'c' then
            return false, nil
        end

        local step_type = self.pause_pace.step_type
        local call_depth = self.pause_pace.call_depth
        local prev_step = self.pause_pace.prev_step

        if step_type == 'over' then
            if call_depth == 0 and not step.is_call then
                return true, 'over'
            end
            return false, nil
        end

        if step_type == 'out' then
            local prev_step_is_return = prev_step and prev_step.is_return
            if call_depth < 0 and prev_step_is_return then
                return true, 'out'
            end
            return false, nil
        end

        if step_type == 'into' then
            local prev_step_is_call = (prev_step and prev_step.is_call
                                       and prev_step.scope ~= 'c')
            if call_depth > 0 and prev_step_is_call then
                return true, 'into'
            end

            -- 不能进入下一层函数时，行为同 over 了
            if call_depth == 0 and not step.is_call then
                return true, 'into'
            end

            return false, nil
        end

        return false, nil
    end,

    set_skip_all = function(self, value)
        self.skip_all = value
    end,

    set_skip_files = function(self, value)
        self.skip_files = value
    end,

    set_pause_breakpoints = function(self, urls)
        local breakpoints = {}
        for _, url in ipairs(urls) do
            table.insert(breakpoints, BreakPoint:new(url))
        end
        self.pause_breakpoints = breakpoints
    end,

    set_pause_pace = function(self, value)
        self.pause_pace = {
            step_type = value,
            prev_step = nil,
            call_depth = 0,
        }
    end,

    finish_pause_pace = function(self)
        self.pause_pace = nil
    end,

    trace_pause_pace = function(self, step)
        if self.pause_pace == nil then
            return
        end

        local depth = self.pause_pace.call_depth
        if step.event == 'call' or step.event == 'tailcall' then
            depth = depth + 1
        elseif step.event == 'return' then
            depth = depth - 1
        end

        self.pause_pace.prev_step = step
        self.pause_pace.call_depth = depth
    end,

    execute_pause = function(self, stacks)
        self.pausing_stacks = stacks
        self:finish_pause_pace()
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

    debug_print = function(self)
        print('behavior>')
        print(string.format('  skip_all: %s', self.skip_all))
        for _, v in ipairs(self.skip_files) do
            print(string.format('  skip_files: %s', v))
        end
        for _, v in ipairs(self.pause_breakpoints) do
            print(string.format('  pause_breakpoints: %s', v.url))
        end
        if self.pause_exception then
            print(string.format('  pause_exception: %s', self.pause_exception))
        end
        if self.pause_pace then
            print(string.format('  pause_pace: %s %s %s',
                self.pause_pace.step_type,
                self.pause_pace.prev_step.event,
                self.pause_pace.call_depth))
        end
    end,

})

return {
    Behavior = Behavior,
}
