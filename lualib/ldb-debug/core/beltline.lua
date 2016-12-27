local aux = require('ldb-debug/aux')
local Environ = require('ldb-debug/core/environ').Environ

return function(handlers, session, event, line)
    local frame = aux.get_frame(1)
    --aux.print_frame(frame, event)
    if aux.is_c_inner_frame(frame) then
        return
    end

    local environ = Environ:new()
    local step = environ:get_step(event)
    aux.print_step(step)

    local stacks = environ:get_stacks()
    if step.event == 'call' and step.line == 19 then
        environ:get_upvalues_dict(1)
        print '--'
        environ:get_upvalues_dict(2)
        print '--'
        environ:get_upvalues_dict(3)
    end

    session:wait_frontend(0)
    for _, handler in ipairs(handlers) do
        handler(step, session, environ)
    end
    session:wait_frontend(0)
end
