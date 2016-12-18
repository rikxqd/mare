local Logger = require('ldb-debug/logger').Logger
local Socket = require('ldb-debug/socket').Socket
local packer = require('ldb-debug/packer')
local tablson = require('ldb-debug/tablson')

local logger = Logger:new('Client')

local Client = {

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
        self.session = props.session
        self.socket = nil
        self.handshaked = false
        self.listeners = {}
        self.buffer = ''
    end,

    start= function(self)
        self.socket = Socket:new({
            host= self.host,
            port= self.port,
        })

        logger:log('connecting')
        self:connect()
    end,

    connect= function(self)
        self.socket:close()
        self.socket:open()
    end,

    send_rawdata= function(self, rawdata)
        if self.socket:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.socket:send(rawdata)
    end,

    recv_rawdata= function(self)
        if self.socket:is_closed() then
            logger:log('reconnecting')
            self:connect()
        end
        return self.socket:recv()
    end,

    parse_buffer= function(self)
        logger:log(self.buffer)
        self.buffer = ''
    end,

    send= function(self, send_data)
        if not self:send_rawdata(send_data) then
            logger:error('send data fail' .. send_data)
            return
        end
        local ok, recv_data = self:recv_rawdata()
        if ok then
            self.buffer = self.buffer .. recv_data
        end
        self:parse_buffer()
    end,

    send_ping= function(self)
        local data = '\x00'
        self:send(data)
    end,

    send_package= function(self, type, args)
        local pkgdata = packer.pack({type, args})
        local data = string.pack('<s4', pkgdata)
        self:send(data)
    end,

    send_handshake= function(self)
        local url = '/session/' .. self.session
        self:send_package('handshake', url)
    end,

    send_message= function(self, message)
        if not self.handshaked then
            self:send_handshake()
        end
        self:send_package('message', message)
    end,

    console_table= function(self, table)
        local message = {
            method= 'consoleTable',
            params= tablson(table),
        }
        self:send_message(message)
    end,

    console_api= function(self, args, style)
        style = style or {}
        local message = {
            method= 'consoleApi',
            params= {
                value= tablson(args),
                type= style.type or 'log',
                stacks= style.stacks or {},
            },
        }
        self:send_message(message)
    end,

}
return {
    Client= Client,
}
