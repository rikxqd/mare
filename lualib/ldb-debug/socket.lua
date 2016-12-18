local lsocket = require('lsocket')
local Logger = require('ldb-debug/logger').Logger

local STATUS_OPENED = 1
local STATUS_CLOSED = 2

local logger = Logger:new('Socket')

local Socket = {

    -- @staticmethod
    new= function(cls, ...)
        local self = {}
        setmetatable(self, cls)
        cls.__index = cls
        cls.constructor(self, ...)
        return self
    end,

    constructor= function(self, props)
        self.host = props.host
        self.port = props.port
        self.socket_impl = nil
        self.timeout = 0
        self.status = STATUS_CLOSED
    end,

    open= function(self)
        local so, err = lsocket.connect(self.host, self.port)
        if err then
            logger:error(err)
        end

        self.socket_impl = so
        if so then
            self.status = STATUS_OPENED
            return true
        else
            self.status = STATUS_CLOSED
            return false
        end
    end,

    close= function(self)
        if self.socket_impl then
            self.socket_impl:close()
            self.socket_impl = nil
        end
        if self.status == STATUS_CLOSED then
            return
        end

        self.status = STATUS_CLOSED
    end,

    send= function(self, data)
        local so = self.socket_impl
        local timeout = self.timeout
        local selects = {so}

        local start = 1
        local length = #data
        while start <= length do
            lsocket.select(nil, selects, timeout)
            local chunk = data:sub(start)
            local nbytes, err = so:send(chunk)
            if err then
                logger:error(err)
                self:close()
                return false, start
            end
            start = start + nbytes
        end
        return true, start
    end,

    recv= function(self)
        local so = self.socket_impl
        local timeout = self.timeout
        local selects = {so}

        local ok = true
        local chunks = {}
        while true do
            lsocket.select(selects, timeout)
            chunk, err = so:recv()
            if chunk == nil then
                if err then
                    logger:error(err)
                else
                    logger:error('remote server closed')
                end
                self:close()
                ok = false
                break
            end

            if chunk == false then
                break
            end

            table.insert(chunks, chunk)
        end

        local data = table.concat(chunks)
        return ok, data
    end,

    is_opened = function(self)
        return self.status == STATUS_OPENED
    end,

    is_closed= function(self)
        return self.status == STATUS_CLOSED
    end,

}

return {
    STATUS_OPENED= STATUS_OPENED,
    STATUS_CLOSED= STATUS_CLOSED,
    Socket= Socket,
}
