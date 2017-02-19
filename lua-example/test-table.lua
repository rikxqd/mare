rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-test')

libdata = require('lib-data')
cmdargs = arg
moduleargs = {...}

main = function()
    print('hole', {1, 2, nil, 4})
    print('variety', libdata.variety)
    print('cmdargs', cmdargs)
    print('moduleargs', moduleargs)
    print('_ENV', _ENV)
end

if (arg[-1] ~= '-i') then
    main()
end

