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
                print(level, name1, name2, name3, name4)
            end

        end
    end
end

sayhi = function(name)
    print('hello', name)
    name = 1
    print('hello', name)
    name = '2'
    print('hello', name)
    name = {'three'}
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
    print('invoke', func(...))
end

steps = function()
    local test1 = function(args)
        local a = 'a'
        local b = 'b'
        print('test1', args, a, b)
        local c = 'c'
    end
    local test2 = function(args)
        local a = 'a'
        local b = 'b'
        print('test2', args, a, b)
        local c = 'c'
    end
    local test3 = function(args)
        local a = 'a'
        local b = 'b'
        print('test3', args, a, b)
        local c = 'c'
    end

    local test_all = function(args)
        test1(args)
        test2(args)
        test3(args)
    end

    test_all('1')
    test_all('2')
    print(test_all('3'), test_all('4'))
    test_all('5')
    test_all('6')
end

main = function()
    invoke(hell)
    invoke(sayhi, 'world')
    invoke(fact, 5)
end

--main()
