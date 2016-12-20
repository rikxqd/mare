local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local bundler = require('ldb-debug/utils/bundler')
local Behavior = require('ldb-debug/core/behavior').Behavior

local logger = Logger:new('Session')

local Session = class({

    constructor= function(self, props)
        self.id = props.id
        self.args = props.args
        self.iostream = props.iostream
        self.behavior = Behavior:new()
        self.handshaked = false
        self.buffer = ''
    end,

    start= function(self)
        logger:log('connecting')
        self:connect()
    end,

    connect= function(self)
        self.iostream:close()
        self.iostream:open()
    end,

    send_rawdata= function(self, rawdata)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:write(rawdata)
    end,

    recv_rawdata= function(self)
        if self.iostream:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.iostream:read()
    end,

    parse_buffer= function(self)
        logger:log(self.buffer)

        -- TODO
        self.buffer = ''
        local messages = {}

        for _, v in ipairs(messages) do
            self:apply_message(v)
        end
    end,

    apply_message= function(self, message)
        local method = message.method
        local params = message.params
        if method == 'updateBreakPoints' then
            self.behavior:update_breakpoints(params)
        end
        if method == 'updateBlackboxFiles' then
            self.behavior:update_blackbox_files(params)
        end
        if method == 'updateProjectConfig' then
            self.behavior:update_project_config(params)
        end
    end,

    send= function(self, send_data)
        if not self:send_rawdata(send_data) then
            logger:error('send data fail: ' .. send_data)
            return
        end
        self:recv()
    end,

    recv= function(self)
        local ok, recv_data = self:recv_rawdata()
        if ok then
            self.buffer = self.buffer .. recv_data
        end
        self:parse_buffer()
    end,

    send_heartbeat= function(self)
        local data = '\x00'
        self:send(data)
    end,

    send_package= function(self, type, args)
        self:send_heartbeat()
        local pkgdata = bundler.pack({type, args})
        local data = string.pack('<s4', pkgdata)
        self:send(data)
    end,

    send_handshake= function(self)
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
