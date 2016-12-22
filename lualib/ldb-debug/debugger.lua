local Session = require('ldb-debug/core/session').Session
local Environ = require('ldb-debug/core/environ').Environ

local hooks_dir = 'ldb-debug/hooks/%s'
local require_hook = function(n) return require(hooks_dir:format(n)) end

local standard = function(IOStream, config)

    local iostream = IOStream:new(config.iostream)
    local session = Session:new({
        id= config.session.id,
        args= config.session.args,
        iostream= iostream,
    })

    Environ:sethooks('crl', {
        require_hook('pretty_print'),
        require_hook('console_api'),
        require_hook('interact_debug'),
    }, session)

    session:start()
end

return {
    standard= standard,
}
