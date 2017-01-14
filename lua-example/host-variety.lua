rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

libdata = require('lib-data')

main = function()
    console.clear()
    print(nil, 100, true, 'hello')
    local fmt = '%s: "%s"'
    for k, v in pairs(libdata) do
        print(fmt:format(k, v), v)
    end
    print(libdata)
end

main()
