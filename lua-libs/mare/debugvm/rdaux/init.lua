local lo = require('mare/utils/lodash')
local frame = require('mare/debugvm/aux/frame')
local step = require('mare/debugvm/aux/step')
local stack = require('mare/debugvm/aux/stack')
local locals = require('mare/debugvm/aux/locals')
local upvalues = require('mare/debugvm/aux/upvalues')
local inspect = require('mare/debugvm/aux/inspect')

local exports = lo.assign({}, frame, step, stack, locals, upvalues, inspect)
return exports
