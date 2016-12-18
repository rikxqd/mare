local msgpack = require 'MessagePack'

local exports = {

    pack= function(lua_obj)
        return msgpack.pack(lua_obj)
    end,

    unpack= function(bytes)
        return msgpack.unpack(bytes)
    end,

}

return exports
