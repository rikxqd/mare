rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

print('pretty print() as console.log()');
debugger.setopt('pretty_print', {type='debug'})
print('pretty print() as console.debug()');
print('mute');
debugger.setopt('pretty_print', {mute=true})
print('you will not see this line in devtools console');
debugger.setopt('pretty_print', {mute=false})
print('unmuted');
print('pretty print() as console.debug()');
