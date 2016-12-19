return function(event, debugger, frontend)
    if event.name ~= 'call' then
        return
    end
    local info = debugger:get_info(1)
    if info == nil then
        return
    end
    if info.what ~= 'C' or info.name ~= 'print' then
        return
    end

    local args = debugger:get_c_func_args(1)
    local uplevel_info = debugger:get_info(2)
    local uplevel_stack = {
        file= uplevel_info.source,
        line= uplevel_info.currentline,
        func= 'print',
    }
    frontend:console_api(args, 'log', {uplevel_stack})
end
