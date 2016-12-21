local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local Behavior = require('ldb-debug/core/behavior').Behavior
local serializer = require('ldb-debug/utils/serializer')
local packager = require('ldb-debug/utils/packager')

local logger = Logger:new('Session')

local Session = class({

    constructor= function(self, props)
        self.id = props.id
        self.args = props.args
        self.iostream = props.iostream
        self.behavior = Behavior:new()
        self.handshaked = false
        self.handshaking = false
        self.chunk = ''
    end,

    start= function(self)
        logger:log('connecting')
        self:connect()
        self:send_handshake()
    end,

    connect= function(self)
        self.handshaked = false
        self.handshaking = false
        self.chunk = ''
        self.iostream:close()
        self.iostream:open()
    end,

    rawsend= function(self, bytes)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:write(bytes)
    end,

    rawrecv= function(self)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:read()
    end,

    feed= function(self, data)
        if data == '' then
            return
        end

        local buffer = self.chunk .. data
        local chunk, pkgs
        chunk, pkgs = packager.parse(buffer)
        self.chunk = chunk

        for _, v in ipairs(pkgs) do
            local cmd = serializer.decode(v)
            local op = cmd[1]
            local args = cmd[2]
            if op == 'handshaked' then
                self.handshaked = true
                self.handshaking = false
            end
            if op == 'message' then
                self:apply_message(args)
            else
                logger:error('unhandle command')
            end
        end
    end,

    apply_message= function(self, message)
        local method = message.method
        local params = message.params
        if method == 'setBreakpoints' then
            self.behavior:set_breakpoints(params)
        end
        if method == 'setBlackboxes' then
            self.behavior:set_blackboxes(params)
        end
        if method == 'setProject' then
            self.behavior:set_project(params)
        end
    end,

    send= function(self, data)
        if not self:rawsend(data) then
            logger:error('send data fail: ' .. data)
            return
        end
        self:recv()
    end,

    recv= function(self)
        local ok, data = self:rawrecv()
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

    send_heartbeat= function(self)
        self:send_package('heartbeat', nil)
    end,

    send_handshake= function(self)
        if self.handshaking then
            return
        end
        self.handshaking = true
        local url = string.format('/session/%s', self.id)
        self:send_package('handshake', url)
    end,

    send_message= function(self, message)
        if not self.handshaked then
            self:send_handshake()
        end
        self:send_package('message', message)
    end,

})

return {
    Session= Session,
}
