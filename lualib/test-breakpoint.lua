local rdebug = require('remotedebug')
local console = require 'ldb-host/console'
rdebug.start('debug-main')

sayhi = function()
    print('one')
    print('two')
    print('three', {x=1})
end

sum = function(x, y)
    sayhi()
    return x + y
end
