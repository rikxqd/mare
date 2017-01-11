rdebug = require('remotedebug')
console = require('ldb/hostvm/console')
debugger = require('ldb/hostvm/debugger')
rdebug.start('debug-general')

libdata = require('lib-data')

key_func = libdata.key_func
key_table = libdata.key_table
key_userdata = libdata.key_userdata
value_array = libdata.value_array
value_dict = libdata.value_dict
value_func = libdata.value_func
value_userdata = libdata.value_userdata
variety = libdata.variety

main = function()
    local fmt = '%s = %s'
    print(fmt:format('key_func', key_func), key_func)
    print(fmt:format('key_table', key_table), key_table)
    print(fmt:format('key_userdata', key_userdata), key_userdata)
    print(fmt:format('value_func', value_func), value_func)
    print(fmt:format('value_dict', value_dict), value_dict)
    print(fmt:format('value_array', value_array, value_array))
    print(fmt:format('value_userdata', value_userdata, value_userdata))
    print(fmt:format('variety', variety), variety)
end

main()
