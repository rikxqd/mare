local class = require('ldb-debug/utils/oo').class

local LineBreakPoint = class({

    constructor= function(self, props)
        self.file = props.file
        self.line = props.line
    end,

    match_event= function(self, event, info)
        if event ~= 'line' then
            return false
        end
        if info.source ~= self.file or info.currentline ~= self.line then
            return false
        end
        return true
    end

})

local ProbeBreakPoint = class({

    constructor= function(self, props)
        self.name = props.name
    end,

    match_event= function(self, event, info)
        if event ~= self.name then
            return false
        end
        return true
    end

})

return {
    LineBreakPoint= LineBreakPoint,
    ProbeBreakPoint= ProbeBreakPoint,
}

