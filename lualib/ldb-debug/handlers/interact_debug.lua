local aux = require('ldb-debug/aux')

local check_pausable = function(step, session, environ)
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
        session:debugger_pause(stacks)
        return
    end
end

local interact_loop = function(step, session, environ)
    local behavior = session.behavior

    if behavior.pausing then
        aux.print_step(step, 'PAUSING')
    end

    while behavior.pausing do
        session:wait_frontend(0.1)
        for _, v in pairs(behavior.stack_locals_queue) do
            v.value = environ:get_locals_dict(v.level, event)
            session:stack_locals(v)
        end
        behavior.stack_locals_queue = {}
        if not behavior.pausing then
            session:debugger_resumed()
        end
    end
end

return function(step, session, environ)
    check_pausable(step, session, environ)
    interact_loop(step, session, environ)
end
