local Session = require('ldb/debugvm/core/session').Session
local beltline = require('ldb/debugvm/core/beltline')

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
    build = build,
    standard = standard,
}
