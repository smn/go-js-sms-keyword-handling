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

    self.add_state(new EndState(
        'red',
        'You chose red!',
        'start'));

    self.add_state(new EndState(
        'green',
        'You chose green!',
        'start'));

    self.add_creator('plus', function(state_name, im) {
        var raw_input = im.get_user_answer('start');
        var msisdn = raw_input.slice(1);
        return new EndState(
            'plus',
            'Adding ' + msisdn + ' to your list',
            'start', {
                on_enter: function() {
                    this.input_event('', function() {});
                }
            });
    });
}

// launch app
var states = new ExampleApp();
var im = new InteractionMachine(api, states);
im.attach();
