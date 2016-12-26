local rdebug = require('remotedebug')
local IOStream = require('iostream-impl/lsocket')
local factory = require('ldb-debug/factory')

local debugger = factory.standard(IOStream, {
    iostream= {
        host= '127.0.0.1',
        port= 8083,
    },
    session= {
        id = 'abcde',
        args = {
            title= 'debug-main',
            expire= -1,
            project= 'ldb-example',
        },
        break_on_start= false,
    },
});

rdebug.hookmask('crl')
rdebug.sethook(debugger.hook)
debugger.start()
