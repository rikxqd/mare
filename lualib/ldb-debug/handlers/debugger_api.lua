local api = {

    idling = function(session)
        session:heartbeat()
        session:sync()
    end,

    reconnect = function(session)
        session:start()
    end,

    behavior = function(session)
        print(session.behavior:to_string())
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
    func(session)
end

