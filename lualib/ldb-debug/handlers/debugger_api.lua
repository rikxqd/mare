local Sandbox = require('ldb-debug/core/sandbox').Sandbox

local api = {

    idling = function(step, session, environ)
        session:heartbeat()
        session:sync()
    end,

    reconnect = function(step, session, environ)
        session:start()
    end,

    behavior = function(step, session, environ)
        print(session.behavior:to_string())
    end,

    repl = function(step, session, environ)
        local behavior = session.behavior
        local frontend = session.frontend
        local environ = environ

        local sandbox = Sandbox:new(step, session, environ)
        sandbox.stack_offset = 1
        for _, item in ipairs(behavior.repl_queue) do
            local ok, value = sandbox:eval(item.code, 2)
            item.error = not ok
            item.value = value
            frontend:repl(item)
        end

        behavior.repl_queue = {}
    end,
}

return function(step, session, environ)
    if step.event ~= 'probe' then
        return
    end

    local prefix = '$debugger.'
    if step.name:find(prefix, 1, true) ~= 1 then
        return
    end

    local action = step.name:sub(#prefix + 1)
    local func = api[action]
    if func == nil then
        return
    end
    func(step, session, environ)
end

