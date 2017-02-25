rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test')

semantics = function()
    console.log('this is', 'log message')
    console.debug('this is', 'debug message')
    console.info('this is', 'info message')
    console.warn('this is', 'warn message')
    console.error('this is', 'error message')
    console.trace('this is', 'trace message')
end

group1 = function()
    console.group('this is', 'expanded group')
    console.log('one')
    console.log('two')
    console.log('three')
    console.group_end()
end

group2 = function()
    console.group_collapsed('this is', 'collapsed gruop')
    console.log('one')
    console.log('two')
    console.log('three')
    console.group_end()
end

main = function()
    semantics()
    group1()
    group2()
end

if (arg[-1] ~= '-i') then
    main()
end
