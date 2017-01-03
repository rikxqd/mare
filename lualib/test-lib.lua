local increase = function(num)
    num = num + 1
    return num
end

local sthwrong = function()
    local num = 1
    num = num + 1
    local err = 'error here' + 1
    return num
end

return {
    increase = increase,
    sthwrong = sthwrong,
}

