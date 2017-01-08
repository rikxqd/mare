local handle = function(step, session, environ)
    if step.event ~= 'call' and step.event ~= 'tailcall' then
        return
    end

    if step.func ~= 'print' or step.scope ~= 'c' then
        return
    end

    local config = session.storage['pretty_print']
    if config and config.mute then
        return
    end

    local stack = environ:get_stack(1)
    local args = environ:get_locals_array(1, step.event)
    local type = (config and config.type) or 'log'
    session.frontend:console_api(args, type, {stack})
end

return {
    name = 'ldb.pretty_print',
    handle = handle,
    init_hook_mask = 'c',
}
