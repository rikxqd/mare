return function(step, session, environ)
    local behavior = session.behavior

    local filename = behavior:match_blackbox(step)
    if filename then
        return
    end

    local breakpoint = behavior:match_breakpoint(step)
    if breakpoint then
        local stacks = environ:get_stacks()
        session:debugger_pause(stacks)
        return
    end

    local movement = behavior:match_movement(step)
    if movement then
        behavior:reset_movement()
        local stacks = environ:get_stacks()
        session:debugger_pause()
        return
    end
end
