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
    this.moveBalls();
    if(this.currentStep % this.STEPS_TO_CREATE_BALL === 0){
        this.spawnBalls();
    }
    this.collideBalls();
    this.recalculateArrowsAndBallDirections();
    this.recalculateStrengths();
    
    console.log(this);
};

Game.prototype.moveBalls = function(){
    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        if(ball.direction === 'N'){
            ball.y++;
        }
        if(ball.direction === 'S'){
            ball.y--;
        }
        if(ball.direction === 'E'){
            ball.x++;
        }
        if(ball.direction === 'W'){
            ball.x--;
        }
    }
};

Game.prototype.spawnBalls = function(){
    this.balls.push({owner:1, strength:this.player1Strength, direction:this.arrows[0][0].direction, x:0, y:0});
    this.balls.push({owner:2, strength:this.player2Strength, direction:this.arrows[this.FIELD_SIZE-1][this.FIELD_SIZE-1].direction});
};

Game.prototype.collideBalls = function(){
    var hypotheticCollisions = [];
    var сollisions = [];
    var i;
    var ball;
    for (i = 0; i < this.balls.length; i++) {
        ball = this.balls[i];
        var cellNumber = this.FIELD_SIZE * ball.x + ball.y;
        if(typeof hypotheticCollisions[cellNumber] === 'undefined'){
            hypotheticCollisions[cellNumber] = [];
            hypotheticCollisions[cellNumber].push(ball);
        } else {
            hypotheticCollisions[cellNumber].push(ball);
            if(hypotheticCollisions[cellNumber].length === 2){
                сollisions.push(cellNumber);
            }
        }
    }
    
    for (i = 0; i < сollisions.length; i ++) {
        var collisionCellNumber = collisions[i];
        var player1BallsStrength = 0;
        var player2BallsStrength = 0;
        var j;
        for (j = 0; j < hypotheticCollisions[collisionCellNumber].length; j++) {
            ball = hypotheticCollisions[collisionCellNumber][j];
            if (ball.owner === 1) {
                player1BallsStrength += ball.strength;
            } else {
                player2BallsStrength += ball.strength;
            }
        }
        
        if (player1BallsStrength == player2BallsStrength) {
            var x = hypotheticCollisions[collisionCellNumber][0].x;
            var y = hypotheticCollisions[collisionCellNumber][0].y;
            this.arrows[x][y].owner = 0;
            this.arrows[x][y].direction='NONE';
        }
        
        player1BallsStrength -= Math.min(player1BallsStrength, player2BallsStrength);
        player2BallsStrength -= Math.min(player1BallsStrength, player2BallsStrength);
        
        for (j = 0; j < hypotheticCollisions[collisionCellNumber].length; j++) {
            ball = hypotheticCollisions[collisionCellNumber][j];
            if (ball.owner === 1) {
                ball.strength = player1BallsStrength;
                player1BallsStrength = 0;
            } else {
                ball.strength = player2BallsStrength;
                player2BallsStrength = 0;
            }
        }
    }
    
    i = this.balls.length;
    while (i--) {
        if(this.balls[i].strength === 0){
            this.balls.splice(i, 1);
        }
    }
};

Game.prototype.recalculateArrowsAndBallDirections = function(){
    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        var arrow = this.arrows[ball.x][ball.y];
        if(arrow.owner == ball.owner){
            ball.direction = arrow.direction;
        } else {
            arrow.owner = ball.owner;

            if(ball.direction === 'N' && ball.y === this.FIELD_SIZE-1){
                ball.direction = 'E';
            }
            if(ball.direction === 'S' && ball.y === 0){
                ball.direction = 'W';
            }
            if(ball.direction === 'E' && ball.x === this.FIELD_SIZE-1){
                ball.direction = 'S';
            }
            if(ball.direction === 'W' && ball.x === 0){
                ball.direction = 'N';
            }
            
            arrow.direction = ball.direction;
        }
    }
};

Game.prototype.recalculateStrengths = function(){
    var player1Strength = 1;
    var player2Strength = 1;
    for (var i = 0; i < this.FIELD_SIZE-1; i++) {
        for (var j = 0; j < this.FIELD_SIZE-1; j++) {
            if(this.arrows[i][j].owner == 1
                && this.arrows[i][j+1].owner == 1
                && this.arrows[i+1][j].owner == 1
                && this.arrows[i+1][j+1].owner == 1){
                    player1Strength++;
                }
            if(this.arrows[i][j].owner == 2
                && this.arrows[i][j+1].owner == 2
                && this.arrows[i+1][j].owner == 2
                && this.arrows[i+1][j+1].owner == 2){
                    player2Strength++;
                }
        }
    }
    this.player1Strength = player1Strength;
    this.player2Strength = player2Strength;
};

Game.prototype.changeArrow = function(player, x, y, dir){
    if((player == 1 || player == 2)
        &&(dir == 'N' && y<this.FIELD_SIZE-1 || dir == 'S' && y>0 || dir == 'E' && x<this.FIELD_SIZE-1 || dir == 'W' && x>0)
        &&(typeof this.arrows[x][y] !== 'undefined')
        &&(this.arrows[x][y].owner == player)
        &&(this.arrows[x][y].direction != dir)){
            this.arrows[x][y].direction != dir;
            return true;
        }

    return false;
};

if(typeof exports !== 'undefined'){
    exports.Game = Game;
}
