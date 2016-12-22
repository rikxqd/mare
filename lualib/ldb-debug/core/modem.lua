local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local serializer = require('ldb-debug/utils/serializer')
local packager = require('ldb-debug/utils/packager')

local logger = Logger:new('Modem')

local Modem = class({

    constructor= function(self, iostream)
        self.iostream = iostream;
        self.listeners = {}
        self.chunk = ''
    end,

    connect= function(self)
        self.chunk = ''
        self.iostream:close()
        self.iostream:open()
        self:emit('connect')
    end,

    on= function(self, event, listener)
        self.listeners[event] = listener
    end,

    emit= function(self, event, ...)
        local listener = self.listeners[event]
        if not listener then
            return
        end
        listener(...)
    end,

    rawsend= function(self, bytes)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:write(bytes)
    end,

    rawrecv= function(self, timeout)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:read(timeout)
    end,

    feed= function(self, data)
        if data == '' then
            return
        end

        local buffer = self.chunk .. data
        local chunk, pkgs
        chunk, pkgs = packager.parse(buffer)
        self.chunk = chunk

        for _, pkg in ipairs(pkgs) do
            local cmd = serializer.decode(pkg)
            self:emit('command', cmd)
        end
    end,

    send= function(self, data)
        if not self:rawsend(data) then
            logger:error('send data fail: %s', data)
            return
        end
        self:recv()
    end,

    recv= function(self, timeout)
        local ok, data = self:rawrecv(timeout)
        if not ok then
            logger:error('recv data fail')
        end
        self:feed(data)
    end,

    send_package= function(self, op, args)
        local pkg = serializer.encode({op, args})
        local data = packager.dump(pkg)
        self:send(data)
    end,

})

return {
    Modem= Modem,
}
