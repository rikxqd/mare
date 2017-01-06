local lo = require('ldb-debug/utils/lodash')
local class = require('ldb-debug/utils/oo').class

local create_console_api = function(impl)
    local alias = {
        warn = 'warning',
        group = 'startGroup',
        group_collapsed = 'startGroupCollapsed',
        group_end = 'endGroup'
    }
    local mt = {
        __index = function(t, k)
            return function(...) impl(alias[k] or k, ...) end
        end,
    }
    return setmetatable({}, mt)
end

local Interacter = class({

    constructor = function(self, step, session, environ)
        self.step = step;
        self.session = session;
        self.environ = environ;
    end,

    get_injects = function(self)
        local frontend = self.session.frontend
        local stacks = self.environ:get_stacks()

        return {
            print = function(...)
                frontend:console_api({...}, 'log', stack)
            end,
            console = create_console_api(function(type, ...)
                frontend:console_api({...}, type, stacks)
            end),
        }
    end,

    create_sandbox = function(self, level)
        local event = self.step.event
        local environ = self.environ

        local locals = environ:get_locals_dict(level, event)
        local upvalues = environ:get_upvalues_dict(level, event)
        local injects = self:get_injects()
        local sandbox = lo.assign({}, upvalues, locals, injects)
        return sandbox
    end,

    eval_code = function(self, code, level)
        if code == 'true' then
            return true, true
        end
        if code == 'false' then
            return true, false
        end

        local chunk_func = 'return ' .. code
        local chunk_name = 'condition'
        local sandbox = self:create_sandbox(level)
        local ok, value = pcall(function()
            local func = load(chunk_func, chunk_name, 't', sandbox)
            -- TODO func() 执行如果出错，会在下一次调用时出现
            -- debugger error: ./ldb-debug/aux/frame.lua:12: Must call in debug client
            return func()
        end)
        if type(value) == 'string' then
            local find = '%g/ldb%-debug/handlers/interact_debug.lua:%d+: '
            value = value:gsub(find, '')
        end
        return ok, value
    end,

    match_cond = function(self, shunt)
        local cond = shunt.cond
        if (not cond) or cond == '' then
            return true
        end
        local ok, value = self:eval_code(cond, 1)
        return ok and value
    end,

    is_need_skip = function(self)
        local step = self.step
        local behavior = self.session.behavior
        local shunt

        shunt = behavior:match_skip_situation(step)
        if shunt then
            return shunt
        end

        shunt = behavior:match_skip_blackbox(step)
        if shunt then
            return shunt
        end

        return nil
    end,

    is_need_pause = function(self)
        local step = self.step
        local behavior = self.session.behavior
        local shunt

        shunt = behavior:match_pause_breakpoint(step)
        if shunt and self:match_cond(shunt) then
            return shunt
        end

        shunt = behavior:match_pause_trapper(step)
        if shunt and self:match_cond(shunt) then
            return shunt
        end

        shunt = behavior:match_pause_pace(step)
        if shunt and self:match_cond(shunt) then
            return shunt
        end

        return nil
    end,

    process_scope_queue = function(self)
        local event = self.step.event
        local behavior = self.session.behavior
        local frontend = self.session.frontend
        local environ = self.environ

        for _, item in ipairs(behavior.scope_queue) do
            if item.type == 'locals' then
                item.value = environ:get_locals_dict(item.level, event)
            elseif item.type == 'upvalues' then
                item.value = environ:get_upvalues_dict(item.level, event)
            else
                item.value = {}
            end
            frontend:stack_scope(item)
        end

        behavior.scope_queue = {}
    end,

    process_watch_queue = function(self)
        local behavior = self.session.behavior
        local frontend = self.session.frontend
        local environ = self.environ

        for _, item in ipairs(behavior.watch_queue) do
            local ok, value = self:eval_code(item.code, item.level)
            item.error = not ok
            item.value = value
            frontend:stack_watch(item)
        end

        behavior.watch_queue = {}
    end,

    trace_step = function(self)
        self.session.behavior:trace_step(self.step)
    end,

    loop = function(self)
        local environ = self.environ
        local session = self.session
        local behavior = session.behavior
        local frontend = session.frontend

        --print(self.behavior:to_string())
        local stacks = environ:get_stacks()
        behavior:execute_pause(stacks)
        frontend:execute_paused(stacks)

        while behavior:is_pausing() do
            session:sync(0.1)
            self:process_scope_queue()
            self:process_watch_queue()
        end
    end,

})

return function(step, session, environ)
    local interacter = Interacter:new(step, session, environ)

    local skip_shunt = interacter:is_need_skip()
    if skip_shunt then
        --environ.aux.print_step(step, 'SKIP')
        print(skip_shunt:to_string())
        return
    end

    local pause_shunt = interacter:is_need_pause()
    if not pause_shunt then
        interacter:trace_step()
        return
    end

    --environ.aux.print_step(step, 'PAUSE')
    print(pause_shunt:to_string())
    interacter:loop()
end
