local split = function(str, sep)
    local fields = {}
    local pattern = string.format('([^%s]+)', sep)
    string.gsub(str, pattern, function(c)
        table.insert(fields, c)
    end)
    return fields
end

return {
    split = split,
}
