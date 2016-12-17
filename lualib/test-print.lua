local rdebug = require 'remotedebug'
rdebug.start('debugbackend')

local printlib = require 'print-lib'

print('hello', 'world')
printlib.custom_print('msg1_value', 'msg_value', 'var1_value', 'var2_value');
