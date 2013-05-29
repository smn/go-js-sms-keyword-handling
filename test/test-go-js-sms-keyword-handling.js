var fs = require("fs");
var assert = require("assert");
var vumigo = require("vumigo_v01");
var app = require("../lib/go-js-sms-keyword-handling");

// This just checks that you hooked you InteractionMachine
// up to the api correctly and called im.attach();
describe("test api", function() {
    it("should exist", function() {
        assert.ok(app.api);
    });
    it("should have an on_inbound_message method", function() {
        assert.ok(app.api.on_inbound_message);
    });
    it("should have an on_inbound_event method", function() {
        assert.ok(app.api.on_inbound_event);
    });
});

describe("SMS keyword application", function() {

    var tester = new vumigo.test_utils.ImTester(app.api, {
        async: true
    });

    it('should accept "red" as a keyword and transition to a state', function(done) {
        var p = tester.check_state({
            user: null,
            content: 'red',
            next_state: 'red',
            response: 'You chose red!',
            continue_session: false
        });
        p.then(done, done);
    });

    it('should accept "green" as a keyword and transition to a state', function(done) {
        var p = tester.check_state({
            user: null,
            content: 'green',
            next_state: 'green',
            response: 'You chose green!',
            continue_session: false
        });
        p.then(done, done);
    });

    it('should complain about "blue" as a keyword', function(done) {
        var p = tester.check_state({
            user: null,
            content: 'blue',
            next_state: 'start',
            response: 'Invalid keyword provided',
            continue_session: true
        });
        p.then(done, done);
    });
});