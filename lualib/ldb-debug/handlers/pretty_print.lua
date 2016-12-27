return function(step, session, environ)
    if step.event ~= 'call' and step.event ~= 'tailcall' then
        return
    end

    if step.func ~= 'print' or step.scope ~= 'c' then
        return
    end

    local stack = environ:get_stack(1)
    local args = environ:get_locals_array(1, step.event)
    session:console_api(args, 'log', {stack})
end
