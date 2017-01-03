local aux = require('ldb-debug/aux')

local is_need_skip = function(step, session)
    local behavior = session.behavior
    local shunt

    shunt = behavior:match_skip_situation(step)
    if shunt then
        return shunt
    end

    shunt = behavior:match_skip_blackbox(step)
    if shunt then
        return shunt
    end

    return nil
end

local is_need_pause = function(step, session)
    local behavior = session.behavior
    local shunt

    shunt = behavior:match_pause_breakpoint(step)
    if shunt then
        return shunt
    end

    shunt = behavior:match_pause_trapper(step)
    if shunt then
        return shunt
    end

    shunt = behavior:match_pause_pace(step)
    if shunt then
        return shunt
    end

    return nil
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

    --print(behavior:to_string())
    local stacks = environ:get_stacks()
    behavior:execute_pause(stacks)
    frontend:execute_paused(stacks)

    while behavior:is_pausing() do
        session:sync(0.1)
        process_scope_queue(step, session, environ)
    end
end

return function(step, session, environ)
    local shunt

    shunt = is_need_skip(step, session)
    if shunt then
        --aux.print_step(step, 'SKIP')
        print(shunt:to_string())
        return
    end

    shunt = is_need_pause(step, session)
    if shunt then
        --aux.print_step(step, 'PAUSE')
        print(shunt:to_string())
        interact_loop(step, session, environ)
    else
        session.behavior:trace_pause_pace(step)
    end
end
