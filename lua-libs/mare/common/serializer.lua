local msgpack = require('MessagePack')

msgpack.set_array('without_hole')
msgpack.set_number('double')
msgpack.set_string('binary')

local encode = function(obj)
    return msgpack.pack(obj)
end

local decode = function(bytes)
    return msgpack.unpack(bytes)
end

return {
    encode = encode,
    decode = decode,
}
