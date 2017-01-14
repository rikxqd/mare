rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
tabson = require('ldb/utils/tabson')
serializer = require('ldb/utils/serializer')
rdebug.start('debug-general')

libdata = require('lib-data')

test_variety = function()
    for k, v in pairs(libdata) do
        local dumped = tabson.dump(v)
        print(k, dumped.root, dumped.refs, dumped.count)
    end
end

test_misc = function()
    local ele = libdata.value_func
    local metatable = {__tostring=libdata.value_func}
    local items = {
        {'nil', nil},
        {'table_metatable', setmetatable({x=1}, metatable)},
        {'table_repeat', {ele, ele}},
    }

    for _, item in ipairs(items) do
        local dumped = tabson.dump(item[2])
        print(item[1], dumped.root, dumped.refs, dumped.count)
    end
end

test_env = function()
    local dumped = tabson.dump(_ENV)
    print('_ENV', dumped.root, dumped.refs, dumped.count)
end

save_dump = function()
    local dumped = tabson.dump(libdata.variety)
    local data = serializer.encode(dumped)
    local file = io.open('data.msgpack', 'w')
    file:write(data)
    file:close()
end

main = function()
    console.clear()
    test_variety()
    test_misc()
    test_env()
end

--main()
save_dump()
