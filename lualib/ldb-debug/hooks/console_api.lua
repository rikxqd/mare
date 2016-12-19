return function(event, debugger, frontend)
    local prefix = '$console-'
    if event.name:find(prefix) ~= 1 then
        return
    end

    local type = event.name:sub(#prefix + 1)
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

    frontend:console_api(args, type, stacks);
end
