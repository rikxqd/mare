rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

libmath = require('lib-math')

hell = function()
    local count = 1
    local name = 'level 1'
    return function()
        count = count + 1
        local name = 'level 2'
        return function()
            count = count + 1
            local name = 'level 3'
            return function()
                count = count + 1
                local name = 'level 4'
                print(strint.format('count in %s: %d', name, count))
            end
        end
    end
end

hello = function(name)
    print('hello', name)
    name = 'one'
    print('hello', name)
    name = 'two'
    print('hello', name)
    name = 'three'
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
    print('invoking', func, ...)
    func(...)
end

steps = function()

    local test1 = function(args)
        local a = 'a'
        local b = 'b'
        local c = 'c'
    end

    local test2 = function(args)
        local a = 'a'
        local b = 'b'
        return 'ret1'
    end

    local test3 = function(args)
        local a = 'a'
        return nil, 'ret2'
    end

    local period = function(args)
        print('test1 return', test1(args))
        print('test2 return', test2(args))
        print('test3 return', test3(args))
    end

    period('period 1')
    print(period('period 2'), period('period 3'))
    period('period 4')
end

probe = function(name)
    print('begin probe', name)
    rdebug.probe(name);
    print('end probe', name)
end

main = function()
    hell()()()()
    invoke(hello, 'world')
    invoke(fact, 5)
    invoke(steps)
    invoke(probe, 'test')
end

--main()
