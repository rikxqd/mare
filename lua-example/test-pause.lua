rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test', {pause=true})

libmath = require('lib-math')

main = function()
    local upvalue_dict = {x=1, y=2, z=3}
    local upvalue_array = {'one', 'two', 'three'}
    local shadowed = 'upvalue_shadowed'

    local func = function(...)
        local funcargs = {...}
        local shadowed = 'local_shadowed'
        local local_num = 1
        local local_string = '+1s'
        local local_func = libmath.formula_sum
        local local_ref_upvalues = {upvalue_array, upvalue_dict}
        debugger.pause()

        local ret1 = local_func(libmath.increase_one(local_num), 3)
        local ret2 = local_string .. ' excited!'
        return ret1, ret2
    end

    print('func()')
    local ret1, ret2 = func('vararg1', 'vararg2', nil, 'vararg4')
    print(string.format('func() return: %q, %q', ret1, ret2))
end

if (arg[-1] ~= '-i') then
    main()
end
