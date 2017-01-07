local aux = require('ldb/debugvm/aux')
local Session = require('ldb/debugvm/core/session').Session
local beltline = require('ldb/debugvm/core/beltline')

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

    return {
        hook = hook,
        mask = mask,
        session = session,
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
