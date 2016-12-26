local fp = require('ldb-debug/utils/fp')
local frame = require('ldb-debug/aux/frame')
local locals = require('ldb-debug/aux/locals')
local inspect = require('ldb-debug/aux/inspect')

local exports = fp.assign({}, frame, locals, inspect)
return exports
