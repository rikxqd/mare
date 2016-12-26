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
    --aux.print_step(step)

    session:wait_frontend(0)
    for _, handler in ipairs(handlers) do
        handler(step, session, environ)
    end
    session:wait_frontend(0)
end
