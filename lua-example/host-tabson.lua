rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
tabson = require('ldb/utils/tabson')
serializer = require('ldb/utils/serializer')
rdebug.start('debug-general')

libdata = require('lib-data')

test_basic = function()
    local value_array = libdata.value_array
    local value_dict = libdata.value_dict
    local value_func = libdata.value_func
    local variety = libdata.variety
    local metatable = {__tostring=libdata.value_func}

    local items = {
        {'nil', nil},
        {'boolean', true},
        {'number', 100},
        {'string', 'hello'},
        {'function_c', tonumber},
        {'function_lua', value_func},
        {'userdata', io.stdout},
        {'coroutine', coroutine.create(value_func)},
        {'table_array', value_array},
        {'table_dict', value_dict},
        {'table_variety', variety},
        {'table_metatable', setmetatable({x=1}, metatable)},
        {'table_repeat', {value_func, value_func}},
    }

    for _, item in ipairs(items) do
        local dumped = tabson.dump(item[2])
        print(item[1], dumped.root, dumped.refs, dumped.count)
    end

    local dumped = tabson.dump(variety)
    local data = serializer.encode(dumped)
    local file = io.open('data.msgpack', 'w')
    file:write(data)
    file:close()

end

test_env = function()
    local dumped = tabson.dump(_ENV)
    print('_ENV', dumped.root, dumped.refs, dumped.count)
end

main = function()
    console.clear()
    test_basic()
    test_env()
end

main()
