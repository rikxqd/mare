local class = require('ldb-debug/utils/oo').class
local libstr = require('ldb-debug/utils/string')
local Behavior = require('ldb-debug/core/behavior').Behavior
local Frontend = require('ldb-debug/core/frontend').Frontend
local Modem = require('ldb-debug/core/modem').Modem

local Session = class({

    constructor = function(self, config, iostream)
        self.config = config

        self.modem = Modem:new(iostream)
        self.behavior = Behavior:new()
        self.frontend = Frontend:new()

        self.modem:on('connect', self:on_modem_connect())
        self.modem:on('disconnect', self:on_modem_disconnect())
        self.modem:on('command', self:on_modem_command())
        self.frontend:on('message', self:on_frontend_message())

        self.connected = false
        self.handshaked = false
    end,

    start = function(self)
        self.modem:connect()
    end,

    on_modem_connect = function(self)
        return function()
            self.connected = true
            self.handshaked = false
            self:handshake()
        end
    end,

    on_modem_disconnect = function(self)
        return function()
            self.connected = false
            self.handshaked = false
        end
    end,

    on_modem_command = function(self)
        return function(command)
            local op = command[1]
            local args = command[2]
            if op == 'handshaked' then
                self:apply_handshaked(args)
                return
            end
            if op == 'message' then
                self:apply_message(args)
                return
            end
        end
    end,

    on_frontend_message = function(self)
        return function(message)
            self:message(message)
        end
    end,

    apply_handshaked = function(self)
        self.handshaked = true
        self:restore_state()
    end,

    apply_message = function(self, message)
        local method = message.method
        local params = message.params
        if method == 'behavior.setSkipSituation' then
            self.behavior:set_skip_situation(params)
            return
        end
        if method == 'behavior.setSkipBlackBoxes' then
            self.behavior:set_skip_blackboxes(params)
            return
        end
        if method == 'behavior.setPauseBreakpoints' then
            self.behavior:set_pause_breakpoints(params)
            return
        end
        if method == 'behavior.setPauseTrapper' then
            self.behavior:set_pause_trapper(params)
            return
        end
        if method == 'behavior.setPausePace' then
            self.behavior:set_pause_pace(params)
            return
        end
        if method == 'behavior.executeResume' then
            self.behavior:execute_resume(params)
            return
        end
        if method == 'behavior.queryScope' then
            self.behavior:query_scope(params)
            return
        end
        if method == 'behavior.queryWatch' then
            self.behavior:query_watch(params)
            return
        end
        if method == 'behavior.queryRepl' then
            self.behavior:query_repl(params)
            return
        end
    end,

    restore_state = function(self)
        local behavior = self.behavior
        local frontend = self.frontend
        if behavior:is_pausing() then
            frontend:execute_paused(behavior.pausing_stacks)
        else
            frontend:execute_resumed()
        end
    end,

    heartbeat = function(self)
        self.modem:send('heartbeat')
    end,

    handshake = function(self)
        local query = libstr.urlencode(self.config.args)
        local url = string.format('/session/%s?%s', self.config.id, query)
        self.modem:send('handshake', url)

        while self.connected and not self.handshaked do
            self.modem:recv(0.1)
        end
    end,

    message = function(self, message)
        self.modem:send('message', message)
    end,

    sync = function(self, timeout)
        self.modem:recv(timeout)
    end,

})

return {
    Session = Session,
}
