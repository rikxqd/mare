local aux = require('ldb-debug/aux')

local is_match_pause_state = function(step, behavior)
    local blackbox = behavior:match_blackbox(step)
    if blackbox then
        return false
    end

    local exception = behavior:match_exception(step)
    if exception then
        return true
    end

    local breakpoint = behavior:match_breakpoint(step)
    if breakpoint then
        return true
    end

    local movement = behavior:match_movement(step)
    if movement then
        return true
    end

    return false
end

local process_stack_scope_queue = function(session, behavior, environ) 
    for _, v in ipairs(behavior.stack_scope_queue) do
        if v.type == 'locals' then
            v.value = environ:get_locals_dict(v.level, event)
        elseif v.type == 'upvalues' then
            v.value = environ:get_upvalues_dict(v.level, event)
        else
            v.value = {}
        end
        session:stack_scope(v)
    end
    behavior.stack_scope_queue = {}
end

local interact_loop = function(session, behavior, environ)
    local stacks = environ:get_stacks()
    session:debugger_pause(stacks)

    behavior.pausing = true
    while true do
        session:wait_frontend(0.1)
        process_stack_scope_queue(session, behavior, environ)
        if not behavior.pausing then
            session:debugger_resumed()
            break
        end
    end

end

return function(step, session, environ)
    local behavior = session.behavior
    local need_pause = is_match_pause_state(step, behavior)
    if need_pause then
        aux.print_step(step, 'PAUSING')
        interact_loop(session, behavior, environ)
    end
end
