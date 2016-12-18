local rdebug = require('remotedebug')
rdebug.start('debug-main')

console = require 'ldb-host/console'

function semantics()
    console.log('i am', 'log message');
    console.debug('i am', 'debug message');
    console.info('i am', 'info message');
    console.warn('i am', 'warn message');
    console.error('i am', 'error message');
    console.trace('i am', 'trace message');
end

function groups() 
    console.group('i am', 'expanded group');
    console.log('one')
    console.log('two')
    console.log('three')
    console.groupEnd();

    console.groupCollapsed('i am', 'collapsed gruop');
    console.log('one')
    console.log('two')
    console.log('three')
    console.groupEnd();
end

function runall()
    semantics()
    groups()
end

function main()
    runall()
end

main()
