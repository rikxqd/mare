local class = require('ldb/utils/oo').class

local print = function() end

local LOG = '[LOGG] %s'
local WARN = '[WARN] %s'
local ERROR = '[ERRO] %s'

local Logger = class({

    constructor = function(self, name)
        self.name = name
    end,

    log = function(self, fmt, ...)
        print(LOG:format(self.name), fmt:format(...))
    end,

    warn = function(self, fmt, ...)
        print(WARN:format(self.name), fmt:format(...))
    end,

    error = function(self, fmt, ...)
        print(ERROR:format(self.name), fmt:format(...))
    end,

})

return {
    Logger = Logger,
}
