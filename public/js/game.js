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
    this.nextBallId = 1;

    this.provinceOwners = [];
    for (i = 0; i < this.FIELD_SIZE-1; i++) {
        this.provinceOwners[i] = [];
        for (j = 0; j < this.FIELD_SIZE-1; j++) {
            this.provinceOwners[i][j] = 0;
        }
    }
};

Game.prototype.start = function(){
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
    this.addBall({owner:1, strength:this.player1Strength, direction:this.arrows[0][0].direction, x:0, y:0, id:this.nextBallId++});
    this.addBall({owner:2, strength:this.player2Strength, direction:this.arrows[this.FIELD_SIZE-1][this.FIELD_SIZE-1].direction, x:this.FIELD_SIZE-1, y:this.FIELD_SIZE-1, id:this.nextBallId++});
};

Game.prototype.addBall = function(obj){
    this.balls.push(obj);
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
        var collisionCellNumber = сollisions[i];
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
console.log("Collision ("+hypotheticCollisions[collisionCellNumber][0].x+", "+hypotheticCollisions[collisionCellNumber][0].y+")");
        if (player1BallsStrength == player2BallsStrength) {
            var x = hypotheticCollisions[collisionCellNumber][0].x;
            var y = hypotheticCollisions[collisionCellNumber][0].y;
            if (this.arrows[x][y].owner !== 0) {
                this.changeArrowOwner(x, y, 0);
            }
            this.arrows[x][y].owner = 0;
            if (this.arrows[x][y].direction != 'NONE') {
                this.changeArrowDirection(x, y, 'NONE');
            }
        }
        
        var strengthLostByBothPlayers = Math.min(player1BallsStrength, player2BallsStrength);
        player1BallsStrength -= strengthLostByBothPlayers;
        player2BallsStrength -= strengthLostByBothPlayers;
        
        for (j = 0; j < hypotheticCollisions[collisionCellNumber].length; j++) {
            ball = hypotheticCollisions[collisionCellNumber][j];
            if (ball.owner === 1) {
                if (ball.strength != player1BallsStrength){
                    this.setBallStrength(ball, player1BallsStrength);
                }
                player1BallsStrength = 0;
            } else {
                if (ball.strength != player2BallsStrength){
                    this.setBallStrength(ball, player2BallsStrength);
                }
                player2BallsStrength = 0;
            }
        }
    }
    
    i = this.balls.length;
    while (i--) {
        if(this.balls[i].strength === 0){
            this.removeBallAtIndex(i);
        }
    }
};

Game.prototype.changeArrowOwner = function(x, y, newOwner){
    this.arrows[x][y].owner = newOwner;
}

Game.prototype.changeArrowDirection = function(x, y, newDirection){
    this.arrows[x][y].direction = newDirection;
}

Game.prototype.setBallStrength = function(ball, newStrength){
    ball.strength = newStrength;
};

Game.prototype.removeBallAtIndex = function(i){
console.log("Ball destroyed: "+this.balls[i].id)
    this.balls.splice(i, 1);
};

Game.prototype.recalculateArrowsAndBallDirections = function(){
    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        var arrow = this.arrows[ball.x][ball.y];
        if(arrow.owner == ball.owner){
            if (ball.direction != arrow.direction){
                this.changeBallDirection(ball, arrow.direction);
            }
        } else {
            this.changeArrowOwner(ball.x, ball.y, ball.owner);
            var newBallDirection;
            if(ball.direction === 'N' && ball.y === this.FIELD_SIZE-1){
                newBallDirection = (ball.x === this.FIELD_SIZE-1)? 'W' : 'E' ;
            } else if(ball.direction === 'S' && ball.y === 0){
                newBallDirection = (ball.x === 0)? 'E' : 'W' ;
            } else if(ball.direction === 'E' && ball.x === this.FIELD_SIZE-1){
                newBallDirection = (ball.y === 0)? 'N' : 'S';
            } else if(ball.direction === 'W' && ball.x === 0){
                newBallDirection = (ball.y === this.FIELD_SIZE-1)? 'S' : 'N';
            }
            
            if (typeof newBallDirection !== 'undefined') {
                this.changeBallDirection(ball, newBallDirection);
            }
            
            if (arrow.direction != ball.direction) {
                this.changeArrowDirection(ball.x, ball.y, ball.direction);
            }
        }
    }
};

Game.prototype.changeBallDirection = function(ball, newDirection){
    ball.direction = newDirection;
}

Game.prototype.recalculateStrengths = function(){
    var player1Strength = 1;
    var player2Strength = 1;
    for (var i = 0; i < this.FIELD_SIZE-1; i++) {
        for (var j = 0; j < this.FIELD_SIZE-1; j++) {
            var owner = 0;
            if(this.arrows[i][j].owner == 1
                && this.arrows[i][j+1].owner == 1
                && this.arrows[i+1][j].owner == 1
                && this.arrows[i+1][j+1].owner == 1){
                    player1Strength++;
                    owner = 1;
                }
            if(this.arrows[i][j].owner == 2
                && this.arrows[i][j+1].owner == 2
                && this.arrows[i+1][j].owner == 2
                && this.arrows[i+1][j+1].owner == 2){
                    player2Strength++;
                    owner = 2;
                }
        
            if(this.provinceOwners[i][j] != owner){
                this.changeProvinceOwner(i, j, owner);
            }
        }
    }
    this.player1Strength = player1Strength;
    this.player2Strength = player2Strength;
};

Game.prototype.changeProvinceOwner = function(x, y, newOwner){
    this.provinceOwners[x][y] = newOwner;
}

Game.prototype.setArrow = function(player, x, y, dir){
    if((player == 1 || player == 2)
        &&(dir == 'N' && y<this.FIELD_SIZE-1 || dir == 'S' && y>0 || dir == 'E' && x<this.FIELD_SIZE-1 || dir == 'W' && x>0)
        &&(typeof this.arrows[x][y] !== 'undefined')
        &&(this.arrows[x][y].owner == player)
        &&(this.arrows[x][y].direction != dir)){
            this.changeArrowDirection(x, y, dir);
            return true;
        }

    return false;
};

if(typeof exports !== 'undefined'){
    exports.Game = Game;
}
