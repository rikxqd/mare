local rdebug = require('remotedebug')
local console = require 'ldb-host/console'
rdebug.start('debug-main')

sum = function(x, y)
    print('one')
    print('two')
    print('three', {x=1})
    return x + y
end
