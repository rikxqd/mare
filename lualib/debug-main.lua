local IOStream = require('iostream-impl/lsocket')
local debugger = require('ldb-debug/debugger')

debugger.standard(IOStream, {
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
        }
    },
});
