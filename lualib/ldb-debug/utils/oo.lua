local new = function(cls, ...)
    local self = {}
    setmetatable(self, cls)
    cls.__index = cls
    if cls.constructor then
        cls.constructor(self, ...)
    end
    return self
end

local class = function(body)
    body.new = new;
    return body;
end

return {
    class= class,
}
