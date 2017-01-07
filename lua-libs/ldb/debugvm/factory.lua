local aux = require('ldb/debugvm/aux')
local Session = require('ldb/debugvm/core/session').Session
local Environ = require('ldb/debugvm/core/environ').Environ

local beltline = function(handlers, session, event, line)
    local frame = aux.get_frame(1)
    --aux.print_frame(frame, event)
    if aux.is_c_inner_frame(frame) then
        return
    end

    local environ = Environ:new()
    local step = environ:get_step(event)
    --aux.print_step(step)

    session:sync()
    for _, handler in ipairs(handlers) do
        handler(step, session, environ)
    end
end

local start_args = aux.get_locals_array(0)

local build = function(IOStream, config, handlers)
    local iostream = IOStream:new(config.iostream)
    local session = Session:new(config.session, iostream)

    local hook = function(event, line)
        beltline(handlers, session, event, line)
    end
    local mask = function()
        return 'crl';
    end
    local start = function()
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
    end

    return {
        hook = hook,
        mask = mask,
        start = start,
    }
end

local standard = function(IOStream, config)
    local dir = 'ldb/debugvm/handlers/%s'
    local loader = function(n) 
        return require(dir:format(n))
    end

    return build(IOStream, config, {
        loader('debugger_api'),
        loader('interact_debug'),
        loader('pretty_print'),
        loader('console_api'),
    });
end

return {
    start_args = start_args,
    build = build,
    standard = standard,
}
