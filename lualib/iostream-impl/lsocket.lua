local lsocket = require('lsocket')

local STATUS_OPENED = 1
local STATUS_CLOSED = 2

local IOStream = {

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
        self.socket = nil
        self.timeout = 0
        self.status = STATUS_CLOSED
    end,

    open= function(self)
        local socket, err = lsocket.connect(self.host, self.port)
        self.socket = socket
        if socket then
            self.status = STATUS_OPENED
            return true, nil
        else
            self.status = STATUS_CLOSED
            return false, err
        end
    end,

    close= function(self)
        if self.socket then
            self.socket:close()
            self.socket = nil
        end
        self.status = STATUS_CLOSED
    end,

    write= function(self, data)
        local socket = self.socket
        local timeout = self.timeout
        local selects = {socket}

        local error = nil
        local sent = 1
        local length = #data
        while sent <= length do
            lsocket.select(nil, selects, timeout)
            local chunk = data:sub(sent)
            local nbytes, err = socket:send(chunk)
            if err then
                error = err
                break
            end

            sent = sent + nbytes
        end

        if error then
            self:close()
            return false, error
        end

        return true, nil
    end,

    read= function(self, timeout)
        if not timeout then
            timeout = self.timeout
        end

        local socket = self.socket
        local selects = {socket}

        local error = nil
        local chunks = {}
        while true do
            lsocket.select(selects, timeout)
            local chunk, err = socket:recv()
            if chunk == nil then
                error = err or 'remote closed'
                break
            end

            if chunk == false then
                break
            end

            table.insert(chunks, chunk)
        end

        local data = table.concat(chunks)

        if error then
            self:close()
            return false, error
        end

        return true, data
    end,

    is_opened = function(self)
        return self.status == STATUS_OPENED
    end,

    is_closed= function(self)
        return self.status == STATUS_CLOSED
    end,

}

return IOStream
