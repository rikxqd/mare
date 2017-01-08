rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

local a = {
    x = 1,
    y = 1,
}

print('hello, world');
print('hello, 1');
print('hello, 2');
