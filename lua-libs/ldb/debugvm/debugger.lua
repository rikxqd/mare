local lo = require('ldb/utils/lodash')
local libstr = require('ldb/utils/string')
local class = require('ldb/utils/oo').class
local aux = require('ldb/debugvm/aux')
local Session = require('ldb/debugvm/core/session').Session
local Environ = require('ldb/debugvm/core/environ').Environ

local builtin_handlers = {
    require('ldb/debugvm/handlers/debugger_api'),
    require('ldb/debugvm/handlers/interact_debug'),
    require('ldb/debugvm/handlers/pretty_print'),
    require('ldb/debugvm/handlers/console_api'),
}

local Debugger = class({

    constructor = function(self, config, IOStream)
        self.config = config
        self:init_session(IOStream)
        self:init_handlers()
        self:init_mask()
    end,

    init_session = function(self, IOStream)
        local config = self.config
        local iostream = IOStream:new(config.iostream)
        self.session = Session:new(config.session, iostream)
    end,

    init_handlers = function(self)
        self.handlers = lo.clone(builtin_handlers)
    end,

    init_mask = function(self)
        local concat = ''

        for _, handler in ipairs(self.handlers) do
            concat = concat .. handler.init_hook_mask
        end

        if self.config.pause_on_start then
            concat = concat .. 'r'
        end

        self.mask = libstr.uniqchars(concat)
    end,

    start = function(self)
        local config = self.config
        local session = self.session
        local behavior = session.behavior

        if config.pause_on_start then
            local step = aux.get_step()
            local breakpoint = {
                event = 'return',
                func = 'start',
                file = step.file,
                line = step.line,
            }
            behavior:set_pause_breakpoints({breakpoint})
        end

        session:start()
    end,

    hook = function(self, event, line)
        local frame = aux.get_frame(1)
        --aux.print_frame(frame, event)
        if aux.is_c_inner_frame(frame) then
            return
        end

        local environ = Environ:new()
        local step = environ:get_step(event)
        --aux.print_step(step)

        local session = self.session
        local handlers = self.handlers
        local masks = {}

        session:sync()
        for _, handler in ipairs(handlers) do
            handler.handle(step, session, environ)
        end

        --self.mask = libstr.uniqchars(environ.mask_chars)
    end,

    get_host_args = function(cls)
        return aux.get_locals_array(0)
    end,
})

return {
    Debugger = Debugger,
}
