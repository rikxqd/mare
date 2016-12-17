local lsocket = require 'lsocket'
local rdebug = require 'remotedebug'
local msgpack = require 'MessagePack'

local dumpable
dumpable = function(table, level)
    level = level or 1
    local ret = {}
    for k, v in pairs(table) do
        local key_type = type(k)
        local key_repr
        if key_type == 'function' then
            key_repr = string.format('[%s]', k)
        elseif key_type == 'table' then
            key_repr = string.format('[%s]', k)
        else
            key_repr = string.format('[%q]', k)
        end

        local value_type = type(v)
        local value_repr
        if value_type == 'function' then
            value_type = string.format('[%s]', k)
        elseif value_type == 'table' then
            if level < 2 then
                value_repr = dumpable(v)
            else
                value_repr = '[level limit]'
            end
        elseif value_type == 'userdata' then
            value_repr = '[userdata]'
        else
            value_repr = v
        end

        ret[key_repr] = value_repr
    end
    return ret
end

local Client = {}

function Client:new(instance)
     instance = instance or {}
     setmetatable(instance, self)
     self.__index = self
     return instance
end

function Client:connect(host, port)
    local so, err = lsocket.connect(host, port)
    if not so then
        print('error: ' .. err)
        so = nil
    end
    self.so = so
    self.host = host
    self.port = port
    self.handshaked = false
end

function Client:reconnect()
    self:connect(self.host, self.port)
    print('reconnect');
end

function Client:raw_send(data)
    local so = self.so
    local from = 1
    local len = #data
    while from <= len do
        lsocket.select(nil, {so})
        local chunk = data:sub(from)
        local bytes = so:send(chunk)
        if bytes == nil then
            return false
        end
        from = from + bytes
    end
    return true
end

function Client:raw_recv()
    local so = self.so
    lsocket.select({so})
    data, err = so:recv()

    if data == nil then
        if err then
            print('error: ' .. err)
        else
            print('colsed')
        end
        self.so = nil
        return false
    end

    if data == false then
        print('no reply')
    else
        print('reply:' .. data)
    end
    return true
end

function Client:send(data)
    data = string.pack('<s8', data)
    return self:raw_send(data)
end

function Client:command(type, data)
    local pack = {type, data}
    local data = msgpack.pack(pack)
    return self:send(data)
end

function Client:ping()
    return self:command('ping', '')
end

function Client:handshake()
    local url = '/session/abcde?project=1234'
    self:command('handshake', url)
    self.handshaked = true
end

function Client:message(data)
    self:ping() -- 卧槽，非得要两次
    if not self:ping() then
        self:reconnect()
    end
    if not self.handshaked then
        self:handshake()
    end
    self:command('message', data)
end

function Client:consoleTable(data)
    local message = {
        method= 'consoleTable',
        params= data,
    }
    self:message(message)
end

function Client:consolePrint(data)
    local message = {
        method= 'consolePrint',
        params= data,
    }
    self:message(message)
end

client = Client:new()
client:connect('127.0.0.1', 8083)

function func_args()
	local i = 1
    local args = {}
	while true do
		local name, v = rdebug.getlocal(1, i)
		if name == nil then
			break
		end
        if rdebug.type(v) == 'userdata' then
            break
        end
		table.insert(args, rdebug.value(v))
		i = i + 1
	end
    return args
end

local last_info = {}
rdebug.sethook(function(event, line)
    local info = rdebug.getinfo(1)
    if info == nil then
        return
    end
    if event == 'call' and info.what == 'C' and info.name == 'print' then
        local args = func_args()
        local value = table.concat(args, '\t')
        client:consolePrint({
            file= last_info.source,
            value= value,
            line= last_info.currentline,
        });
        client:consoleTable({
            last_info= last_info,
            info= info,
        });
    end
    if event == 'line' then
        last_info = info
    end
end)
rdebug.hookmask('crl')
