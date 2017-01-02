local aux = require('ldb-debug/aux')

local is_need_skip = function(step, session)
    local behavior = session.behavior

    if behavior:match_skip_all(step) then
        return true
    end

    if behavior:match_skip_file(step) then
        return true
    end

    return false
end

local is_need_pause = function(step, session)
    local behavior = session.behavior
    local pause, info

    pause, info = behavior:match_pause_exception(step)
    if pause then
        print('pause_exception:', info)
        return true
    end

    pause, info = behavior:match_pause_breakpoint(step)
    if pause then
        print('pause_breakpoint:', info)
        return true
    end

    pause, info = behavior:match_pause_pace(step)
    if pause then
        print('pause_pace:', info)
        return true
    end

    return false
end

local process_scope_queue = function(step, session, environ)
    local behavior = session.behavior
    local frontend = session.frontend
    local event = step.event

    for _, item in ipairs(behavior.scope_queue) do
        if item.type == 'locals' then
            item.value = environ:get_locals_dict(item.level, event)
        elseif item.type == 'upvalues' then
            item.value = environ:get_upvalues_dict(item.level, event)
        else
            item.value = {}
        end
        frontend:stack_scope(item)
    end

    behavior.scope_queue = {}
end

local interact_loop = function(step, session, environ)
    local behavior = session.behavior
    local frontend = session.frontend

    local stacks = environ:get_stacks()
    behavior:execute_pause(stacks)
    frontend:execute_paused(stacks)

    --behavior:debug_print()
    while behavior:is_pausing() do
        session:sync(0.1)
        process_scope_queue(step, session, environ)
    end
end

return function(step, session, environ)
    if is_need_skip(step, session) then
        return
    end

    if is_need_pause(step, session) then
        --aux.print_step(step, 'PAUSING')
        interact_loop(step, session, environ)
    else
        session.behavior:trace_pause_pace(step)
    end
end
