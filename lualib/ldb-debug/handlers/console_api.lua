return function(step, session, environ)
    if step.event ~= 'probe' then
        return
    end

    local prefix = '$console.'
    if step.name:find(prefix) ~= 1 then
        return
    end

    local type = step.name:sub(#prefix + 1)
    local args = environ:get_locals_array(1, step.event)
    local stacks = environ:get_stacks()
    table.remove(stacks, 1)

    session:console_api(args, type, stacks);
end
