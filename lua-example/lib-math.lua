local increase = function(num)
    num = num + 1
    return num
end

local formula_add = function(a, b)
    local fmt ='%s + %s = %s'
    local result = fmt:format(a, b, a + b)
    return result
end

return {
    increase = increase,
    formula_add = formula_add,
}
