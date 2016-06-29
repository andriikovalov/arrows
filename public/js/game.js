var Game = function() {
    this.STEP_DURATION = 2000;
    this.STEPS_TO_CREATE_BALL = 3;
    this.FIELD_SIZE = 5;

    this.arrows = [];
    for (var i = 0; i < this.FIELD_SIZE; i++) {
        this.arrows[i] = [];
        for (var j = 0; j < this.FIELD_SIZE; j++) {
            this.arrows[i][j] = {owner:0, direction:'NONE'};
        }
    }
    
    this.arrows[0][0].owner = 1;
    this.arrows[0][0].direction = 'N';

    this.arrows[this.FIELD_SIZE-1][this.FIELD_SIZE-1].owner = 2;
    this.arrows[this.FIELD_SIZE-1][this.FIELD_SIZE-1].direction = 'S';
    
    this.currentStep = 0;
    this.balls = [];
    this.player1Strength = 1;
    this.player2Strength = 1;
};

Game.prototype.start = function(){
    console.log(this);
    var self = this;
    setInterval(function() {
        self.step.call(self);
    }, this.STEP_DURATION);
};

Game.prototype.step = function(){
    this.currentStep++;
    if(this.currentStep % this.STEPS_TO_CREATE_BALL === 0){
        this.spawnBalls();
    }
    // move collide changeFlags
};

Game.prototype.spawnBalls = function(){
    this.balls.push({owner:1, strength:this.player1Strength, direction:this.arrows[0][0].direction});
    this.balls.push({owner:2, strength:this.player2Strength, direction:this.arrows[this.FIELD_SIZE-1][this.FIELD_SIZE-1].direction});
};

Game.prototype.changeArrow = function(player, x, y, dir){
    if((player === 1 || player === 2)
        &&(dir === 'N' || dir === 'S' || dir === 'E' || dir === 'W')
        &&(this.arrows[x][y] !== 'undefined')
        &&(this.arrows[x][y].owner === player)
        &&(this.arrows[x][y].direction !== dir)){
            this.arrows[x][y].direction !== dir;
            return true;
        }

    return false;
};

if(typeof exports !== 'undefined'){
    exports.Game = Game;
}
