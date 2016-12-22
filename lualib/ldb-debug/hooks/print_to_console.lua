return function(event, debugger, frontend)
    if event.name ~= 'call' then
        return
    end
    local frame = debugger:get_frame(1)
    if frame == nil then
        return
    end
    if frame.what ~= 'C' or frame.name ~= 'print' then
        return
    end

    local uplevel_frame = debugger:get_frame(2)
    local uplevel_stack = {
        file= uplevel_frame.source,
        line= uplevel_frame.currentline,
        func= 'print',
    }

    local args = debugger:get_c_func_args(1)
    frontend:console_api(args, 'log', {uplevel_stack})
end
