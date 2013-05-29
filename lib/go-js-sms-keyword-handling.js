var vumigo = require("vumigo_v01");
var jed = require("jed");

if (typeof api === "undefined") {
    // testing hook (supplies api when it is not passed in by the real sandbox)
    var api = this.api = new vumigo.dummy_api.DummyApi();
}

var State = vumigo.states.State;
var EndState = vumigo.states.EndState;
var InteractionMachine = vumigo.state_machine.InteractionMachine;
var StateCreator = vumigo.state_machine.StateCreator;

function KeywordState(name, next, keywords, error, handlers) {
    var self = this;
    State.call(self, name, handlers);
    self.next = next;
    self.keywords = keywords;
    self.error_text = error;
    self.in_error = false;

    var orig_on_enter = self.on_enter;
    self.on_enter = function() {
        self.in_error = false;
        return orig_on_enter();
    };

    self.current_keywords = function() {
        return self.keywords;
    };

    self.process_keyword = function(keyword) {
        // return true if the keyword has been handled completely
        // or false if the keyword should be propagated to the
        // next state handler.
        return false;
    };

    self.input_event = function(keyword, done) {
        if(!keyword) { keyword = ""; }
        keyword = keyword.trim();
        var keywords = self.current_keywords();
        if(keywords.indexOf(keyword) == -1) {
            self.in_error = true;
            done();
            return;
        }

        if(self.process_keyword(keyword)) {
            done();
            return;
        }

        self.call_possible_function(
            self.next, self, [keyword],
            function(next) {
                self.im.set_user_state(next);
                self.save_response(keyword);
                done();
            }
        );
    };

    self.display = function() {
        return self.error_text;
    };
}

function ExampleApp() {
    var self = this;
    // The first state to enter
    StateCreator.call(self, 'start');

    self.add_state(new KeywordState(
        'start',
        function(keyword) {
            return keyword;
        },
        ['red', 'green'],
        'Invalid keyword provided!')
    );

    self.add_state(new EndState(
        'red',
        'You chose red!',
        'start'));

    self.add_state(new EndState(
        'green',
        'You chose green!',
        'start'));
}

// launch app
var states = new ExampleApp();
var im = new InteractionMachine(api, states);
im.attach();
