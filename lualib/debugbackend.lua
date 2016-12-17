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
                value_repr = dumpable(v, level + 1)
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
        self.handshaked = false
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
    local ok, err = self:raw_send(data)
    client:raw_recv()
    return ok
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
    self:ping()
    if self.so == nil then
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
        params= dumpable(data),
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

function func_args(level)
	local i = 1
    local args = {}
	while true do
		local name, v = rdebug.getlocal(level, i)
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

function func_varargs(level)
	local i = -1
    local args = {}
	while true do
		local name, v = rdebug.getlocal(level, i)
		if name == nil then
			break
		end
        if rdebug.type(v) == 'userdata' then
            break
        end
		table.insert(args, rdebug.value(v))
		i = i - 1
	end
    return args
end

local handlers = {}

function handlers.do_print(event, line)
    local info = rdebug.getinfo(1)
    if info == nil then
        return
    end
    if event == 'call' and info.what == 'C' and info.name == 'print' then
        local args = func_args(1)
        local value = table.concat(args, '\t')
        local up_info = rdebug.getinfo(2)
        client:consolePrint({
            value= value,
            type= 'log',
            stacks= {
                {
                    file= up_info.source,
                    line= up_info.currentline,
                    func= 'print',
                }
            }
        });
    end
end

function handlers.do_trace(event, line)
    if event:find('$console-') ~= 1 then
        return
    end
    local info = rdebug.getinfo(1)

    local args = func_varargs(1)
    local value = table.concat(args, ' ')

    local stacks = {}
    local i = 2
    while true do
        local info = rdebug.getinfo(i)
        if info == nil then
            break
        end
        if info.name == nil and info.what == 'C' then
            break
        end
        local name = info.name
        if name == nil and info.what == 'main' then
            name = '(main)'
        end

        stack = {
            file= info.source,
            line= info.currentline,
            func= name,
        }
        table.insert(stacks, stack)
        i = i + 1
    end

    client:consolePrint({
        value= value,
        type= event:sub(10),
        stacks= stacks,
    });
end

rdebug.sethook(function(event, line)
    handlers.do_print(event, line)
    handlers.do_trace(event, line)
end)
rdebug.hookmask('crl')
