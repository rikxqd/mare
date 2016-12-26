local do_idling = function(session)
    session:wait_frontend(0)
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
    if step.name:find(prefix) ~= 1 then
        return
    end

    local action = step.name:sub(#prefix + 1)
    do_idling(session)

    if action == 'breakpoints' then
        do_breakpoints(session)
        return
    end
end

