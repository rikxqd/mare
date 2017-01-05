local class = require('ldb-debug/utils/oo').class
local tablson = require('ldb-debug/core/tablson')

local Frontend = class({

    constructor = function(self)
        self.listeners = {}
    end,

    on = function(self, event, listener)
        self.listeners[event] = listener
    end,

    emit = function(self, event, ...)
        local listener = self.listeners[event]
        if listener then
            listener(...)
        end
    end,

    console_api = function(self, args, type, stacks)
        local message = {
            method = 'consoleApi',
            params = {
                value = tablson(args),
                type = type,
                stacks = stacks,
            },
        }
        self:emit('message', message)
    end,

    execute_paused = function(self, stacks)
        local message = {
            method = 'executePaused',
            params = {
                stacks = stacks,
            },
        }
        self:emit('message', message)
    end,

    execute_resumed = function(self)
        local message = {
            method = 'executeResumed',
            params = nil,
        }
        self:emit('message', message)
    end,

    stack_scope = function(self, item)
        local message = {
            method = 'stackScope',
            params = {
                level = item.level,
                type = item.type,
                value = tablson(item.value),
                parrot = item.parrot,
            }
        }
        self:emit('message', message)
    end,

    stack_watch = function(self, item)
        local message = {
            method = 'stackWatch',
            params = {
                code = item.code,
                value = item.value,
                error = item.error,
                parrot = item.parrot,
            }
        }
        self:emit('message', message)
    end,
})

return {
    Frontend = Frontend,
}
