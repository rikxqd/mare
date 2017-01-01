local aux = require('ldb-debug/aux')

local is_match_pause_state = function(step, session)
    local behavior = session.behavior
    local skip, pause, info

    skip, info = behavior:match_skip_all(step)
    if skip then
        print(':skip_all:', info)
        return false
    end

    skip, info = behavior:match_skip_file(step)
    if skip then
        print(':skip_file:', info)
        return false
    end

    pause, info = behavior:match_pause_exception(step)
    if pause then
        print(':pause_exception:', info)
        return true
    end

    pause, info = behavior:match_pause_breakpoint(step)
    if pause then
        print(':pause_breakpoint:', info)
        return true
    end

    pause, info = behavior:match_pause_pace(step)
    if pause then
        print(':pause_pace:', info)
        return true
    end
    behavior:trace_pause_pace(step)

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

    --session.behavior:debug_print()
    while session.behavior:is_pausing() do
        session:sync(0.1)
        process_scope_queue(session, environ)
    end
end

return function(step, session, environ)
    local need_pause = is_match_pause_state(step, session)
    if not need_pause then
        return
    end
    --aux.print_step(step, 'PAUSING')
    interact_loop(session, environ)
end
