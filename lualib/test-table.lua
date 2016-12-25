rdebug = require('remotedebug')
rdebug.start('debug-main')

tbl = {
    'number 1',
    [2]= 'number 2',
    ['1']= 'string 1',
    callback= function() end,
    name= 'string name, be overrided',
    ['name']= 'string name',
    point= {x=1, y=2, z= 3},
    words= {'one', 'two', 'three'},
    [false]= 'boolean false',
    [true]= 'boolean true',
    [function() end]='function 0x123456',
    [{}]= 'table 0x123456',
};

print(tbl)
