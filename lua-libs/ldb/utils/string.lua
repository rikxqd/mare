local split = function(str, sep)
    local fields = {}
    local pattern = string.format('([^%s]+)', sep)
    string.gsub(str, pattern, function(c)
        table.insert(fields, c)
    end)
    return fields
end

local urlencode = function(query)
    local items = {}
    for k, v in pairs(query) do
        table.insert(items, string.format('%s=%s', k, v))
    end
    return table.concat(items, '&')
end

return {
    split = split,
    urlencode = urlencode,
}
