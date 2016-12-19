local Session = require('ldb-debug/core/session').Session
local Frontend = require('ldb-debug/core/frontend').Frontend
local Environ = require('ldb-debug/core/environ').Environ

local require_hook = function(name)
    local path = string.format('ldb-debug/hooks/%s', name)
    return require(path)
end

local standard = function(IOStream, config)

    local frontend = Frontend:new()
    Environ:sethooks('crl', {
        require_hook('print_to_console'),
        require_hook('console_api'),
    }, frontend)

    local iostream = IOStream:new(config.iostream)
    local session = Session:new({
        id= config.session.id,
        args= config.session.args,
        iostream= iostream,
    })

    frontend.session = session
    session:start()
end

return {
    standard= standard,
}
