local rdebug = require 'remotedebug'
rdebug.start('debugbackend')

console = require 'print-lib'

print('hello', 'world')

function nest()
    console.info('info', 'xxx', 'yyy', 'zzz');
    console.error('error', 'xxx', 'yyy', 'zzz');
    console.warn('warn', 'xxx', 'yyy', 'zzz');
    console.trace('trace', 'xxx', 'yyy', 'zzz');
    console.assert('name');
    console.group('name');
    console.log('one')
    console.log('two')
    console.log('three')
    console.groupEnd();
    console.groupCollapsed('name collapsed');
    console.log('one')
    console.log('two')
    console.log('three')
    console.groupEnd();
end

function nest1()
    nest()
end

nest1()
