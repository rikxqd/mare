local handlers = {}

function handlers.do_print(event, line, debugger, client)
    if event ~= 'call' then
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
    client:console_api(args, {
        type= 'log',
        stacks= {uplevel_stack},
    });
end

function handlers.do_console(event, line, debugger, client)
    local prefix = '$console-'
    if event:find(prefix) ~= 1 then
        return
    end

    local type = event:sub(#prefix + 1)
    local args = debugger:get_lua_func_args(1)

    local stacks = {}
    local infos = debugger:get_stack_infos()
    for i = 2, #infos do
        local info = infos[i]
        local name = info.name
        if name == nil and info.what == 'main' then
            name = '(main)'
        end
        stack = {
            file= info.source,
            line= info.currentline,
            func= name,
        }
        table.insert(stacks, stack)
    end

    client:console_api(args, {
        type= type,
        stacks= stacks,
    });
end

return handlers
