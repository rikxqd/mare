rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test')

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

flow = function()

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
    print('probe begin', name)
    rdebug.probe(name)
    print('probe end', name)
end

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
                print(string.format('count in %s: %d', name, count))
            end
        end
    end
end

invoke = function(func, ...)
    func(...)
end

main = function()
    invoke(hello, 'world')
    invoke(fact, 8)
    invoke(flow)
    invoke(probe, 'test')
    invoke(function() hell()()()() end)
end

if (arg[-1] ~= '-i') then
    main()
end
