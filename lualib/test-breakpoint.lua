rdebug = require('remotedebug')
console = require('ldb-host/console')
debugger = require('ldb-host/debugger')
rdebug.start('debug-main')

hell = function()
    local level = 1
    local name1 = 'name 1'

    return function()
        level = level + 1
        local name2 = 'name 2'

        return function()
            level = level + 1
            local name3 = 'name 3'

            return function()
                local name4 = 'name 4'
                print(level, name1, name2, name3)
            end

        end
    end
end

sayhi = function(name)
    print('hello', name)
    name = 'one'
    print('hello', name)
    name = 2
    print('hello', name)
    name = {three= '3'}
    print('hello', name)
    name = nil
    print('hello', name)
end

fact = function(n)
    if n <= 1 then
        return n
    end
    return n * fact(n - 1)
end

invoke = function(func, ...)
    print('invoking', func(...))
end
