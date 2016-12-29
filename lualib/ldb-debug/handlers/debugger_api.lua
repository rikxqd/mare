local do_idling = function(session)
    session:heartbeat()
    session:sync()
end

local do_reconnect = function(session)
    session:start()
end

local do_breakpoints = function(session)
    for _, v in ipairs(session.behavior.breakpoints) do
        print(string.format('breakpoint> %s', v.url))
    end
end

return function(step, session, environ)
    if step.event ~= 'probe' then
        return
    end

    local prefix = '$debugger.'
    if step.name:find(prefix, 1, true) ~= 1 then
        return
    end

    local action = step.name:sub(#prefix + 1)
    if action == 'idling' then
        do_idling(session)
        return
    end
    if action == 'reconnect' then
        do_reconnect(session)
        return
    end
    if action == 'breakpoints' then
        do_breakpoints(session)
        return
    end
end

