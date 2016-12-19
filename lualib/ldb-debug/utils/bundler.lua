local msgpack = require 'MessagePack'

msgpack.set_array('without_hole')
msgpack.set_number('double')
msgpack.set_string('string')

local bundler = {

    pack= function(lua_obj)
        return msgpack.pack(lua_obj)
    end,

    unpack= function(bytes)
        return msgpack.unpack(bytes)
    end,

}

return bundler
