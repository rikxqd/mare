local rdebug = require "remotedebug"

if not pcall(rdebug.start, "debugbackend") then
	print "debugger disable"
end

local mp = require 'MessagePack'

mp.set_number'float'
mp.set_array'with_hole'
mp.set_string'string'

local dumpable
dumpable = function(table)
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
            value_repr = dumpable(v)
        else
            value_repr = v
        end

        ret[key_repr] = value_repr
    end
    return ret
end

test_table = {
  '[1]',
  [2]='[2]',
  name='name',
  [true]='[true]',
  [false]='[false]',
  [{}]='table: 0x123456',
  ['1']='["1"]',
  ['name']='["name"]',
  [function() end]='function: 0x123456',
  table={x=1, y=2, [3]=4},
  func=function() end,
};
--data = mp.unpack(mpac)
c = dumpable(test_table)
for k, i in pairs(c) do
    --print(tostring(k), i);
end

mpac = mp.pack(c)


print(string.format('%q', mpac))
