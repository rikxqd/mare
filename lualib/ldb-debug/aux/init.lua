local fp = require('ldb-debug/utils/fp')
local frame = require('ldb-debug/aux/frame')
local step = require('ldb-debug/aux/step')
local stack = require('ldb-debug/aux/stack')
local locals = require('ldb-debug/aux/locals')
local inspect = require('ldb-debug/aux/inspect')

local exports = fp.assign({}, frame, step, stack, locals, inspect)
return exports
