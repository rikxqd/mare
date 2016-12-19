local class = require('ldb-debug/utils/oo').class

local print = function() end

local Logger = class({

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

})

return {
    Logger= Logger,
}
