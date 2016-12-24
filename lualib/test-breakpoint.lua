local rdebug = require('remotedebug')
local console = require 'ldb-host/console'
rdebug.start('debug-main')

sayhi = function(name)
    print('hi', name)
    name = 'one'
    print('hi', 2)
    name = {three='3'}
    print('hi', name)
    name = nil
    print('hi', name)
end

sum = function(x, y)
    print('%d + %d = %d', x, y, x + y)
end

caller = function(func, ...)
    print('calling', func(...))
end


