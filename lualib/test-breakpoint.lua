rdebug = require('remotedebug')
console = require('ldb-host/console')
rdebug.start('debug-main')

sayhi = function(name)
    print('hello', name)
    name = 'one'
    print('hello', name)
    name = 2
    print('hello', name)
    name = {three= '3'}
    print('hello', name)
    name = nil
    print('hello', name)
end

fact = function(n)
    if n <= 1 then
        return n
    end
    return n * fact(n - 1)
end

invoke = function(func, ...)
    print('invoking', func(...))
end
