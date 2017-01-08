local class = require('ldb/utils/oo').class
local aux = require('ldb/debugvm/aux')
local Session = require('ldb/debugvm/core/session').Session
local Environ = require('ldb/debugvm/core/environ').Environ

local builtin_handlers = {
    {'debugger_api', require('ldb/debugvm/handlers/debugger_api')},
    {'interact_debug', require('ldb/debugvm/handlers/interact_debug')},
    {'pretty_print', require('ldb/debugvm/handlers/pretty_print')},
    {'console_api', require('ldb/debugvm/handlers/console_api')},
}

local Debugger = class({

    constructor = function(self, config, IOStream)
        self.config = config
        self.mask = 'crl'
        self:init_session(IOStream)
        self:init_handlers()
    end,

    init_session = function(self, IOStream)
        local config = self.config
        local iostream = IOStream:new(config.iostream)
        self.session = Session:new(config.session, iostream)
    end,

    init_handlers = function(self)
        local handlers = {}
        for _, v in ipairs(builtin_handlers) do
            table.insert(handlers, v)
        end
        self.handlers = handlers
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
        for _, item in ipairs(handlers) do
            local handler = item[2]
            local mask = handler(step, session, environ)
            if mask then
                table.insert(masks, mask)
            end
        end

        --self.mask = self:merge_masks(masks)
    end,

    merge_masks = function(self, masks)
        local mask_call = false
        local mask_line = false
        local mask_return = false

        for _, v in ipairs(masks) do
            for i = 1, #v + 1 do
                local char = v:sub(i, i)
                if char == 'c' then
                    mask_call = true
                elseif char == 'r' then
                    mask_return = true
                elseif char == 'l' then
                    mask_return = true
                end
            end
        end

        local merged = ''
        if mask_call then
            merged = merged .. 'c'
        end
        if mask_return then
            merged = merged .. 'r'
        end
        if mask_line then
            merged = merged .. 'l'
        end
        print('a', merged)
        return merged
    end,

    get_host_args = function(cls)
        return aux.get_locals_array(0)
    end,
})

return {
    Debugger = Debugger,
}
