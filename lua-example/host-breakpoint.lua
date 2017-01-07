rdebug = require('remotedebug')
console = require('ldb-host/console')
debugger = require('ldb-host/debugger')
rdebug.start('debug-main')

lib = require('test-lib')

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
    print('invoke', func, ...)
    func(...)
end

steps = function()

    local test1 = function(args)
        local a = 'a'
    end

    local test2 = function(args)
        local a = 'a'
        local b = 'b'
        return 'ret1'
    end

    local test3 = function(args)
        local a = 'a'
        local b = 'b'
        local c = 'c'
        return nil, 'ret2'
    end

    local tester = function(args)
        print('test1 return', test1(args))
        print('test2 return', test2(args))
        print('test3 return', test3(args))
    end

    tester('1')
    print(tester('2'), tester('3'))
    tester('4')
end

probe = function(name)
    print('begin probe', name)
    rdebug.probe(name);
    print('end probe', name)
end


main = function()
    invoke(hell)
    invoke(sayhi, 'world')
    invoke(fact, 5)
end

--main()
