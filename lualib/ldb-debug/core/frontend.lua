local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local tablson = require('ldb-debug/core/tablson')

local logger = Logger:new('Frontend')

local Frontend = class({

    constructor= function(self)
        self.session = nil;
    end,

    console_api= function(self, value, type, stacks)
        local message = {
            method= 'consoleApi',
            params= {
                value= tablson(value),
                type= type,
                stacks= stacks,
            },
        }
        self.session:send_message(message)
    end,

})

return {
    Frontend= Frontend,
}
