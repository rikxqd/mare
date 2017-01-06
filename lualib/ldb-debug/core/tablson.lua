local tablson = function(root_table, max_level)
    max_level = max_level or 5

    local convert
    convert = function(tbl, level)
        if tbl == nil then
            return nil
        end

        if level > max_level then
            return '[level limit]'
        end
        level = level + 1

        local ret = {}
        for k, v in pairs(tbl) do
            local key_type = type(k)
            local key_repr
            if key_type == 'function' then
                key_repr = string.format('%s', k)
            elseif key_type == 'table' then
                key_repr = string.format('%s', k)
            elseif key_type == 'userdata' then
                key_repr = string.format('%s', k)
            else
                key_repr = string.format('%q', k)
            end

            local value_type = type(v)
            local value_repr
            if value_type == 'function' then
                value_type = string.format('[%s]', v)
            elseif value_type == 'userdata' then
                value_type = string.format('[%s]', v)
            elseif value_type == 'table' then
                value_repr = convert(v, level)
            else
                value_repr = v
            end

            ret[key_repr] = value_repr
        end

        return ret
    end

    return convert(root_table, 1)
end

return tablson
