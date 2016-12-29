-- API 子集实现 https://lodash.com/docs/4.17.3

local assign = function(object, ...)
    for _, source in ipairs({...}) do
        for k, v in pairs(source) do
            object[k] = v
        end
    end
    return object
end

local constant = function(value)
    return function() return value end
end

return {
    assign = assign,
    constant = constant,
}
