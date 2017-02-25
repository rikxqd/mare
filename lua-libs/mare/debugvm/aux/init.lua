local lo = require('ldb/utils/lodash')
local frame = require('ldb/debugvm/aux/frame')
local step = require('ldb/debugvm/aux/step')
local stack = require('ldb/debugvm/aux/stack')
local locals = require('ldb/debugvm/aux/locals')
local upvalues = require('ldb/debugvm/aux/upvalues')
local inspect = require('ldb/debugvm/aux/inspect')

local exports = lo.assign({}, frame, step, stack, locals, upvalues, inspect)
return exports
