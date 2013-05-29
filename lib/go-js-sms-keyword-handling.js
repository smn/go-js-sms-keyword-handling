var vumigo = require("vumigo_v01");
var jed = require("jed");

if (typeof api === "undefined") {
    // testing hook (supplies api when it is not passed in by the real sandbox)
    var api = this.api = new vumigo.dummy_api.DummyApi();
}

var EndState = vumigo.states.EndState;
var FreeText = vumigo.states.FreeText;
var InteractionMachine = vumigo.state_machine.InteractionMachine;
var StateCreator = vumigo.state_machine.StateCreator;

function SMSEndState(name, text, next, handlers) {
    // State that mimicks the USSD behaviour when a USSD session ends
    // it fast forwards to the start of the InteractionMachine.
    // We need to do this because SMS doesn't have the Session capabities
    // that provide us this functionality when using USSD.
    var self = this;
    handlers = handlers || {};
    if(handlers.on_enter === undefined) {
        handlers.on_enter = function() {
            self.input_event('', function() {});
        };
    }
    EndState.call(self, name, text, next, handlers);
}

function ExampleApp() {
    var self = this;
    // The first state to enter
    StateCreator.call(self, 'start');

    self.add_state(new FreeText(
        'start',
        function(content) {
            if(!content) { content = ""; };
            content = content.trim();
            if(content == 'red') {
                return 'red';
            } else if (content == 'green') {
                return 'green';
            } else if (content[0] == '+') {
                return 'plus';
            }
        },
        'Choices are red, green or something matching `+msisdn`'));

    self.add_state(new SMSEndState(
        'red',
        'You chose red!',
        'start'));

    self.add_state(new SMSEndState(
        'green',
        'You chose green!',
        'start'));

    self.add_creator('plus', function(state_name, im) {
        var raw_input = im.get_user_answer('start');
        var msisdn = raw_input.slice(1);
        return new SMSEndState(
            'plus',
            'Adding ' + msisdn + ' to your list',
            'start');
    });
}

// launch app
var states = new ExampleApp();
var im = new InteractionMachine(api, states);
im.attach();
