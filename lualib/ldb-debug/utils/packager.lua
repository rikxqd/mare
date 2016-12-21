local HEAD_LEN = 4

local dump_fmt = '<s' .. HEAD_LEN
local parse_fmt = '<i' .. HEAD_LEN

local strip_zero = function(bytes)
    local index = 1;
    for i = 1, #bytes do
        local num = bytes:byte(i)
        if (num ~= 0) then
            index = i
            break;
        end
    end
    return bytes:sub(index)
end

local parse_one = function(bytes)
    bytes = strip_zero(bytes)

    if #bytes <= HEAD_LEN then
        return bytes, nil
    end

    local data_len = parse_fmt:unpack(bytes)
    local data_end = HEAD_LEN + data_len
    if #bytes < data_end then
        return bytes, nil
    end

    local pkg = bytes:sub(HEAD_LEN + 1, data_end)
    local chunk = bytes:sub(data_end + 1)
    return chunk, pkg
end

local parse = function(bytes)
    local pkgs = {}
    local chunk = bytes;
    while true do
        local pkg
        chunk, pkg = parse_command(chunk);
        if pkg == nil then
            break
        end
        table.insert(pkgs, pkg)
    end
    return chunk, pkgs
end

local dump = function(pkg)
    return dump_fmt:pack(pkg)
end

return {
    parse= parse,
    dump= dump,
}
