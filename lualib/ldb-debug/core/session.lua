local class = require('ldb-debug/utils/oo').class
local Logger = require('ldb-debug/utils/logger').Logger
local bundler = require('ldb-debug/utils/bundler')
local Behavior = require('ldb-debug/core/behavior').Behavior

local logger = Logger:new('Session')

local trim_heartbeat_bytes = function(data)
    local start = 1;
    for i = 1, #data do
        local num = string.byte(data, i)
        if (num ~= 0) then
            start = i
            break;
        end
    end
    return data:sub(start)
end

local PACK_HEAD_LEN = 4;

local parse_command= function(data)
    data = trim_heartbeat_bytes(data);

    local command = nil;
    if #data <= PACK_HEAD_LEN then
        return {command=command, chunk= data}
    end

    local pack_length = string.unpack('<i4', data) 
    if #data < (PACK_HEAD_LEN + pack_length) then
        return {command=command, chunk= data}
    end

    local pack_data = data:sub(PACK_HEAD_LEN + 1, PACK_HEAD_LEN + pack_length)
    local chunk = data:sub(PACK_HEAD_LEN + pack_length + 1)
    command = bundler.unpack(pack_data);
    return {command= command, chunk=chunk};
end

local parse_commands= function(data)
    local commands = {}
    local chunk = data;
    while true do
        local result = parse_command(chunk);
        chunk = result.chunk;
        if result.command == nil then
            break
        end
        table.insert(commands, result.command)
    end
    return {commands= commands, chunk= chunk};
end

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

    feed= function(self, new_data)
        if new_data == '' then
            return
        end
        local data = self.buffer .. new_data
        local result = parse_commands(data)
        local commands = result.commands
        self.buffer = result.chunk
        if #commands == 0 then
            return
        end

        for _, v in ipairs(commands) do
            local type = v[1]
            local data = v[2]
            if type == 'message' then
                self:apply_message(data)
            else
                logger:error('unhandle command')
            end
        end
    end,

    apply_message= function(self, message)
        local method = message.method
        local params = message.params
        print(method, params)
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
        if not ok then
            logger:error('recv data fail')
        end
        self:feed(recv_data)
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
