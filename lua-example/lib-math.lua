local increase_one = function(num)
    num = num + 1
    return num
end

local formula_sum = function(a, b)
    local fmt ='%s + %s = %s'
    local result = fmt:format(a, b, a + b)
    return result
end

return {
    increase_one = increase_one,
    formula_sum = formula_sum,
}
