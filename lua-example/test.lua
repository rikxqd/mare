rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test')

print('hello, world')
