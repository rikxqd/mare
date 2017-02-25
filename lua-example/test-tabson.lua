rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test')

tabson = require('mare/utils/tabson')
serializer = require('mare/common/serializer')
libdata = require('lib-data')

test_data = function()
    console.group_collapsed('test_data()')
    for k, v in pairs(libdata) do
        local dumped = tabson.dump(v)
        console.log(k, v, dumped)
    end
    console.group_end()
end

test_misc = function()
    local ele = libdata.value_func
    local metatable = {__tostring=libdata.value_func}
    local items = {
        {'nil', nil},
        {'table_metatable', setmetatable({x=1}, metatable)},
        {'table_repeat', {ele, ele}},
    }

    console.group_collapsed('test_misc()')
    for _, item in ipairs(items) do
        local dumped = tabson.dump(item[2])
        console.log(item[1], item[2], dumped)
    end
    console.group_end()
end

save = function()
    local dumped = tabson.dump(libdata.variety)
    local data = serializer.encode(dumped)
    local name = 'test-tabson.msgpack'
    local file = io.open(name, 'w')
    file:write(data)
    file:close()
    console.info(string.format('file %s created, %d bytes.', name, #data))
end

main = function()
    console.clear()
    test_data()
    test_misc()
end

if (arg[1] == 'save') then
    save()
    return
end

if (arg[-1] ~= '-i') then
    main()
end

