local print = function() end

local Logger = {

    new= function(cls, ...)
        local self = {}
        setmetatable(self, cls)
        cls.__index = cls
        cls.constructor(self, ...)
        return self
    end,

    constructor= function(self, name)
        self.name = name
    end,

    log= function(self, fmt, ...)
        local prefix = string.format('[LOG ]%s', self.name)
        print(prefix, string.format(fmt, ...))
    end,

    warn= function(self, fmt, ...)
        local prefix = string.format('[WARN]%s', self.name)
        print(prefix, string.format(fmt, ...))
    end,

    error= function(self, fmt, ...)
        local prefix = string.format('[ERR ]%s', self.name)
        print(prefix, string.format(fmt, ...))
    end,
}

return {
    Logger= Logger,
}
