local rdebug = require 'remotedebug'

local function expand_value(v)
	local value_type = rdebug.type(v)
	if value_type == 'function' then
        return rdebug.value(v)
    end

	if value_type ~= 'table' then
        return v
    end

    local table = {}
	local key, value
	while true do
		key, value = rdebug.next(v, key)
		if key == nil then
			break
		end
        table[key] = expand_value(value)
	end
    return table
end

local Debugger = {

    new= function(cls, ...)
        local self = {}
        setmetatable(self, cls)
        cls.__index = cls
        cls.constructor(self, ...)
        return self
    end,

    constructor= function(self)
        self.info_items = {}
        self.c_func_args_items = {}
        self.lua_func_args_items = {}
        self.stack_infos = nil
    end,

    get_info= function(self, level)
        local key = tostring(level)
        local item = self.info_items[key]
        if item ~= nil then
            return item.value
        end

        local info = rdebug.getinfo(level)
        self.info_items[key] = {
            value= info,
        }
        return info
    end,

    get_c_func_args= function(self, level)
        local key = tostring(level)
        local item = self.c_func_args_items[key]
        if item ~= nil then
            return item.value
        end

        local i = 1
        local args = {}
        while true do
            local name, v = rdebug.getlocal(level, i)
            if name == nil then
                -- 例如 print(1, 2, {}) 到达这里时，
                -- v 依次是：1, 2, userdata, userdata, nil
                -- 没搞懂怎么会多了个 userdata
                -- 而且内存地址总是一样的
                table.remove(args)
                break
            end
            table.insert(args, expand_value(v))
            i = i + 1
        end

        self.c_func_args_items[key] = {
            value= args,
        }
        return args
    end,

    get_lua_func_args= function(self, level)
        local key = tostring(level)
        local item = self.c_func_args_items[key]
        if item ~= nil then
            return item.value
        end

        local i = -1
        local args = {}
        while true do
            local name, v = rdebug.getlocal(level, i)
            if name == nil then
                break
            end
            table.insert(args, expand_value(v))
            i = i - 1
        end

        self.lua_func_args_items[key] = {
            value= args,
        }
        return args
    end,

    get_stack_infos= function(self)
        if self.stack_infos then
            return self.stack_infos
        end

        local infos = {}
        local i = 1
        while true do
            local info = self:get_info(i)
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

            table.insert(infos, info)
            i = i + 1
        end

        self.stack_infos = infos
        return infos
    end
}

return {
    Debugger= Debugger,
}
