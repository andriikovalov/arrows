var Game = function() {
    this.STEP_DURATION = 2000;
    this.STEPS_TO_CREATE_BALL = 3;
    var FIELD_SIZE = 5;
    var directions = Object.freeze({N: 'north', S: 'south', E: 'east', W: 'west', NONE: 'none'});
    
    this.arrows = [];
    for (var i = 0; i < FIELD_SIZE; i++) {
        this.arrows[i] = [];
        for (var j = 0; j < FIELD_SIZE; j++) {
            this.arrows[i][j] = {owner:0, direction:directions.NONE};
        }
    }
    
    this.arrows[0][0].owner = 1;
    this.arrows[0][0].direction = directions.N;

    this.arrows[FIELD_SIZE-1][FIELD_SIZE-1].owner = 2;
    this.arrows[0][0].direction = directions.S;
    
    this.currentStep = 0;
    this.balls = [];
};

Game.prototype.step = function(){
    this.currentStep++;
    console.log("Step "+this.currentStep);
    if(this.currentStep % this.STEPS_TO_CREATE_BALL === 0){
        console.log("Create ball");
    }
};

Game.prototype.start = function(){
    console.log(this);
    var self = this;
    setInterval(function() {
        self.step.call(self);
    }, this.STEP_DURATION);
};

if(typeof exports !== 'undefined'){
    exports.Game = Game;
}
