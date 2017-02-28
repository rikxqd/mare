rdebug = require('remotedebug')
console = require('mare/hostvm/console')
debugger = require('mare/hostvm/debugger')
rdebug.start('debug-test', {pause=true})

local function tail()
end

local function main()
	return tail()
end

if (arg[-1] ~= '-i') then
    main()
end
