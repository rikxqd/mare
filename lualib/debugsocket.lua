local lsocket = require "lsocket"	-- https://github.com/cloudwu/lsocket
local hook = require "debughook"
local rdebug = require "remotedebug"
local aux = require "debugaux"

local so = nil
function reconnect()
    so = lsocket.connect("127.0.0.1", 8083)
    ok, err = so:status()
    if (not ok) then
        print(err)
        so = nil
        return false
    end
    return true
end

local filename = rdebug.getinfo(2).short_src
local handshake_url = '/session/' .. filename .. '?initExpire=10&initTitle=haha&project=1234\r\n'

local function writestring(s)
	s = s .. "\r\n"

    if so == nil then
        if reconnect() then
            s = handshake_url .. s
        else
            return
        end
    end

	local from = 1
	local len = #s
	while from <= len do
		local rd, wt = lsocket.select(nil, {so})
        local bytes = so:send(s:sub(from))
        if bytes == nil then
            so = nil
            break
        end
		from = from + bytes
	end
end

writestring('hello')

local info = {}
local _print = print
local function print(...)
	rdebug.getinfo(1, info)
	local source = info.source
	local line = info.currentline
	writestring(table.concat({string.format("%s(%d):",source,line),...},"\t"))
end

hook.probe("@test2.lua",8, function()
	local f = aux.frame(1)
	print(f.a, f.b)
end)

hook.probe("@test2.lua",15, function()
	local f = aux.frame(1)
	print(f.s)
end)

hook.probe("@test3.lua",8, function()
	local f = aux.frame(1)
	print(f.a, f.b)
end)

hook.probe("@test3.lua",15, function()
	local f = aux.frame(1)
	print(f.s)
end)

rdebug.sethook(hook.hook)

