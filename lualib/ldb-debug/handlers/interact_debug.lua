local aux = require('ldb-debug/aux')

local is_match_pause_state = function(step, session)
    local behavior = session.behavior

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

local process_scope_queue = function(session, environ)
    for _, item in ipairs(session.behavior.scope_queue) do
        if item.type == 'locals' then
            item.value = environ:get_locals_dict(item.level, event)
        elseif item.type == 'upvalues' then
            item.value = environ:get_upvalues_dict(item.level, event)
        else
            item.value = {}
        end
        session.frontend:stack_scope(item)
    end
    session.behavior.scope_queue = {}
end

local interact_loop = function(session, environ)
    local stacks = environ:get_stacks()
    session.behavior:execute_pause(stacks)
    session.frontend:execute_paused(stacks)

    while session.behavior:is_pausing() do
        session:sync(0.1)
        process_scope_queue(session, environ)
    end

    session.frontend:execute_resumed()
end

return function(step, session, environ)
    local need_pause = is_match_pause_state(step, session)
    if not need_pause then
        return
    end
    aux.print_step(step, 'PAUSING')
    interact_loop(session, environ)
end
