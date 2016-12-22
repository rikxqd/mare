return function(event, debugger, frontend)
    local prefix = '$console-'
    if event.name:find(prefix) ~= 1 then
        return
    end

    local stacks = {}
    local frames = debugger:get_frames()
    table.remove(frames, 1)
    for _, frame in ipairs(frames) do
        local name = frame.name
        if name == nil and frame.what == 'main' then
            name = '(main)'
        end
        stack = {
            file= frame.source,
            line= frame.currentline,
            func= name,
        }
        table.insert(stacks, stack)
    end

    local type = event.name:sub(#prefix + 1)
    local args = debugger:get_lua_func_args(1)
    frontend:console_api(args, type, stacks);
end
