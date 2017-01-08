local handle = function(step, session, environ)
    if step.event ~= 'probe' then
        return
    end

    local prefix = '$console.'
    if step.name:find(prefix, 1, true) ~= 1 then
        return
    end

    local type = step.name:sub(#prefix + 1)
    local args = environ:get_locals_array(1, step.event)
    local stacks = environ:get_stacks()
    table.remove(stacks, 1)

    session.frontend:console_api(args, type, stacks);
end

return {
    name = 'ldb.console_api',
    handle = handle,
    init_hook_mask = '',
}
