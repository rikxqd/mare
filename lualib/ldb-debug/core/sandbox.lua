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

local Sandbox = class({

    constructor = function(self, step, session, environ)
        self.step = step
        self.session = session
        self.environ = environ
        self.stack_offset = 0
    end,

    get_injects = function(self)
        local frontend = self.session.frontend
        local stacks = self.environ:get_stacks()
        for i = 1, self.stack_offset do
            table.remove(stacks, 1)
        end

        return {
            print = function(...)
                frontend:console_api({...}, 'log', stacks)
            end,
            console = create_console_api(function(type, ...)
                frontend:console_api({...}, type, stacks)
            end),
        }
    end,

    get_env = function(self, level)
        local event = self.step.event
        local environ = self.environ

        local locals = environ:get_locals_dict(level, event)
        local upvalues = environ:get_upvalues_dict(level, event)
        local injects = self:get_injects()
        local env = lo.assign({}, upvalues, locals, injects)
        return env
    end,

    eval = function(self, code, level)
        if code == 'true' then
            return true, true
        end
        if code == 'false' then
            return true, false
        end

        local chunk_name = 'eval'
        local env = self:get_env(level)
        local ok, value = pcall(function()
            local func = load(code, chunk_name, 't', env)
            if not func then
                code = 'return ' .. code
                func = load(code, chunk_name, 't', env)
            end

            -- TODO func() 执行如果出错，会在下一次调用时出现
            -- debugger error: ./ldb-debug/aux/frame.lua:12: Must call in debug client
            return func()
        end)
        if type(value) == 'string' then
            local find = '%g/ldb%-debug/core/sandbox.lua:%d+: '
            value = value:gsub(find, '')
        end
        return ok, value
    end,
});

return {
    Sandbox = Sandbox,
}
