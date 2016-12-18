local rdebug = require('remotedebug')
rdebug.start('debug-main')

test_table = {
    'number 1',
    [2]= 'number 2',
    name= 'string name',
    [true]= 'boolean true',
    [false]= 'boolean false',
    [{}]= 'table 0x123456',
    ['1']= 'string 1',
    ['name']= 'string name',
    [function() end]='function 0x123456',
    table_value= {x=1, y=2, z={'a', 'b'}},
    func_value= function() end,
};

function print_types()
    print(1, true, function() end)
    print(test_table)
end

print('hello, world')
print_types()
