var Game = function() {
    this.STEP_DURATION = 2000;
    this.STEPS_TO_CREATE_BALL = 3;
    this.FIELD_SIZE = 5;
    this.BASE_HEALTH = 10;

    this.arrows = [];
    var i,j;
    for (i = 0; i < this.FIELD_SIZE; i++) {
        this.arrows[i] = [];
        for (j = 0; j < this.FIELD_SIZE; j++) {
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
    this.player1BaseHealth = this.BASE_HEALTH;
    this.player2BaseHealth = this.BASE_HEALTH;
    this.nextBallId = 1;

    this.provinceOwners = [];
    for (i = 0; i < this.FIELD_SIZE-1; i++) {
        this.provinceOwners[i] = [];
        for (j = 0; j < this.FIELD_SIZE-1; j++) {
            this.provinceOwners[i][j] = 0;
        }
    }
    
    this.winner = 0;
    this.draw = false;
    
    this.arrowChangesNextTurnQueue = [];
};

Game.prototype.start = function(){
    this.LAST_STEP = Date.now();
    var self = this;
    this.intervalHandle = setInterval(function() {
        self.step.call(self);
    }, this.STEP_DURATION);
};

Game.prototype.stop = function(){
    clearInterval(this.intervalHandle);
};

Game.prototype.step = function(){
    this.currentStep++;
    this.LAST_STEP = Date.now();
    this.moveBalls();
    if(this.currentStep % this.STEPS_TO_CREATE_BALL === 0){
        this.spawnBalls();
    }
    this.collideBalls();
    this.collideBases();
    this.recalculateArrowsAndBallDirections();
    this.recalculateStrengths();
    this.scheduleCollisionsInTheMiddle();
    this.checkIfSomebodyWon();
    this.applyArrowChangesFromQueue();
};

Game.prototype.getGameTime = function(){
    return this.currentStep + this.getStepTime();
};

Game.prototype.getStepTime = function(){
    return (Date.now() - this.LAST_STEP)/this.STEP_DURATION;
};

Game.prototype.moveBalls = function(){
    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        var nextPosition = Game.ballNextPosition(ball);
        ball.x = nextPosition.x;
        ball.y = nextPosition.y;
    }
};

Game.ballNextPosition = function(ball){
    var nextPosition = {x:ball.x, y:ball.y};
    if(ball.direction === 'N'){
        nextPosition.y++;
    }
    if(ball.direction === 'S'){
        nextPosition.y--;
    }
    if(ball.direction === 'E'){
        nextPosition.x++;
    }
    if(ball.direction === 'W'){
        nextPosition.x--;
    }
    return nextPosition;
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
    var collisions = [];
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
                collisions.push(cellNumber);
            }
        }
    }
    
    for (i = 0; i < collisions.length; i ++) {
        var collisionCellNumber = collisions[i];
        var collisionX = hypotheticCollisions[collisionCellNumber][0].x;
        var collisionY = hypotheticCollisions[collisionCellNumber][0].x;
        var collisionResult = this.collideArrayOfBalls(hypotheticCollisions[collisionCellNumber]);
        if(collisionResult.allCrashed){
            var x = collisionResult.x;
            var y = collisionResult.y;
            if(!((x === 0 && y === 0) || (x === this.FIELD_SIZE-1 && y === this.FIELD_SIZE-1))){
                if (this.arrows[x][y].owner !== 0) {
                    this.changeArrowOwner(x, y, 0);
                }
            }
        }
    }
};

Game.prototype.collideArrayOfBalls = function(collidingBalls){
    var collisionResult = {allCrashed:false, x:collidingBalls[0].x, y:collidingBalls[0].y};
    var player1BallsStrength = 0;
    var player2BallsStrength = 0;
    var momentum = {N:0, S:0, E:0, W:0};
    var ball;
    for (var j = 0; j < collidingBalls.length; j++) {
        ball = collidingBalls[j];
        if (ball.owner === 1) {
            player1BallsStrength += ball.strength;
        } else {
            player2BallsStrength += ball.strength;
        }
        momentum[ball.direction] += ball.strength;
    }
    
    var momentumN = momentum.N - momentum.S;
    var momentumE = momentum.E - momentum.W;
    var finalMomentumDirection = 'NONE';
    if (momentumN === 0 || momentumE === 0) {
        if (momentumN > 0) {
            finalMomentumDirection = 'N';
        } else if (momentumN < 0) {
            finalMomentumDirection = 'S';
        } else if (momentumE > 0) {
            finalMomentumDirection = 'E';
        } else if (momentumE < 0) {
            finalMomentumDirection = 'W';
        }
    } else if (momentumN !== 0 && momentumE !== 0) {
        var directionNS = (momentumN > 0) ? 'N' : 'S';
        var directionEW = (momentumE > 0) ? 'E' : 'W';
        var hypotheticalBall = {x:collisionResult.x, y:collisionResult.y, direction:directionNS};
        var canGoNS = this.positionInsideField(Game.ballNextPosition(hypotheticalBall));
        hypotheticalBall.direction = directionEW;
        var canGoEW = this.positionInsideField(Game.ballNextPosition(hypotheticalBall));
        if(canGoNS && !canGoEW){
            finalMomentumDirection = directionNS;
        } else if(!canGoNS && canGoEW){
            finalMomentumDirection = directionEW;
        } else if(canGoNS && canGoEW){
            finalMomentumDirection = (Math.abs(momentumN) < Math.abs(momentumE)) ? directionEW : directionNS;
        }
    }

    if (player1BallsStrength === player2BallsStrength) {
        collisionResult.allCrashed = true;
    }
    
    var strengthLostByBothPlayers = Math.min(player1BallsStrength, player2BallsStrength);
    player1BallsStrength -= strengthLostByBothPlayers;
    player2BallsStrength -= strengthLostByBothPlayers;
        
    for (j = 0; j < collidingBalls.length; j++) {
        ball = collidingBalls[j];
        var ballIndex = this.balls.indexOf(ball);
        if (ball.owner === 1) {
            if (ball.strength != player1BallsStrength){
                this.setBallStrength(ballIndex, player1BallsStrength);
            }
            player1BallsStrength = 0;
        } else {
            if (ball.strength != player2BallsStrength){
                this.setBallStrength(ballIndex, player2BallsStrength);
            }
            player2BallsStrength = 0;
        }
        if(finalMomentumDirection !== 'NONE' && ball.strength > 0){
            this.changeBallDirection(ballIndex, finalMomentumDirection);
        }
    }
        
    var i = collidingBalls.length;
    while (i--) {
        ball = collidingBalls[i];
        if(ball.strength === 0){
            this.removeBallAtIndex(this.balls.indexOf(ball));
        }
    }
    
    return collisionResult;
};

Game.prototype.collideBases = function(){
    for (var i = this.balls.length - 1; i >= 0 ; i--) {
        var ball = this.balls[i];
        if(ball.x === 0 && ball.y === 0 && ball.owner === 2){
            if(this.player1BaseHealth >= ball.strength){
                this.setBaseStrength(1, this.player1BaseHealth - ball.strength);
                this.removeBallAtIndex(i);
            } else {
                this.setBallStrength(i, ball.strength - this.player1BaseHealth);
                this.setBaseStrength(1, 0);
            }
        } else if(ball.x === this.FIELD_SIZE - 1 && ball.y === this.FIELD_SIZE - 1 && ball.owner === 1){
            if(this.player2BaseHealth >= ball.strength){
                this.setBaseStrength(2, this.player2BaseHealth - ball.strength);
                this.removeBallAtIndex(i);
            } else {
                this.setBallStrength(i, ball.strength - this.player2BaseHealth);
                this.setBaseStrength(2, 0);
            }
        }
    }
};

Game.prototype.setBaseStrength = function(playerNum, newStrength){
    if(playerNum === 1){
        this.player1BaseHealth = newStrength;
    } else if(playerNum === 2){
        this.player2BaseHealth = newStrength;
    }
};

Game.prototype.positionInsideField = function(position){
    return position.x >= 0 && position.x < this.FIELD_SIZE && position.y >= 0 && position.y < this.FIELD_SIZE;
};

Game.prototype.changeArrowOwner = function(x, y, newOwner){
    this.arrows[x][y].owner = newOwner;
};

Game.prototype.changeArrowDirection = function(x, y, newDirection){
    this.arrows[x][y].direction = newDirection;
};

Game.prototype.setBallStrength = function(ballIndex, newStrength){
    this.balls[ballIndex].strength = newStrength;
};

Game.prototype.removeBallAtIndex = function(i){
    this.balls.splice(i, 1);
};

Game.prototype.recalculateArrowsAndBallDirections = function(){
    for (var i = 0; i < this.balls.length; i++) {
        var ball = this.balls[i];
        var arrow = this.arrows[ball.x][ball.y];
        if(arrow.owner !== ball.owner){
            this.changeArrowOwner(ball.x, ball.y, ball.owner);
        }
        if(arrow.direction !== 'NONE'){
            if (ball.direction != arrow.direction){
                this.changeBallDirection(i, arrow.direction);
            }
        } else {
            var newBallDirection = '';
            if(ball.direction === 'N' && ball.y === this.FIELD_SIZE-1){
                newBallDirection = (ball.x === this.FIELD_SIZE-1)? 'W' : 'E' ;
            } else if(ball.direction === 'S' && ball.y === 0){
                newBallDirection = (ball.x === 0)? 'E' : 'W' ;
            } else if(ball.direction === 'E' && ball.x === this.FIELD_SIZE-1){
                newBallDirection = (ball.y === 0)? 'N' : 'S';
            } else if(ball.direction === 'W' && ball.x === 0){
                newBallDirection = (ball.y === this.FIELD_SIZE-1)? 'S' : 'N';
            }
            
            if (newBallDirection !== '') {
                this.changeBallDirection(i, newBallDirection);
            }
            
            if (arrow.direction != ball.direction) {
                this.changeArrowDirection(ball.x, ball.y, ball.direction);
            }
        }
    }
};

Game.prototype.changeBallDirection = function(ballNumber, newDirection){
    this.balls[ballNumber].direction = newDirection;
};

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

Game.prototype.scheduleCollisionsInTheMiddle = function(){
    var collisions = [];
    for (var i = 0; i < this.balls.length-1; i++) {
        for (var j = i+1; j < this.balls.length; j++) {
            var ball1 = this.balls[i];
            var ball2 = this.balls[j];
            if(ball1.owner !== ball2.owner){
                var ball1NextPosition = Game.ballNextPosition(ball1);
                if(ball1NextPosition.x === ball2.x && ball1NextPosition.y === ball2.y){
                    var ball2NextPosition = Game.ballNextPosition(ball2);
                    if(ball2NextPosition.x === ball1.x && ball2NextPosition.y === ball1.y){
                        collisions.push([ball1,ball2]);
                    }
                }
            }
        }
    }
    
    if(collisions.length > 0){
        var self = this;
        setTimeout(function() {
            self.collideInTheMiddle.call(self, collisions);
        }, this.STEP_DURATION/2);
    }
};

Game.prototype.collideInTheMiddle = function(collisions){
    for (var i = 0; i < collisions.length; i++) {
        this.collideArrayOfBalls(collisions[i]);
    }
};

Game.prototype.changeProvinceOwner = function(x, y, newOwner){
    this.provinceOwners[x][y] = newOwner;
};

Game.prototype.checkIfSomebodyWon = function(){
    if(this.player1BaseHealth === 0 || this.player2BaseHealth === 0){
        if(this.player1BaseHealth === 0 && this.player2BaseHealth === 0){
            this.draw = true;
        } else if(this.player1BaseHealth === 0){
            this.winner = 2;
        } else if(this.player2BaseHealth === 0){
            this.winner = 1;
        }
        this.endGame();
    }
};

Game.prototype.setArrow = function(player, x, y, dir){
    if((player == 1 || player == 2)
        &&(dir == 'N' && y<this.FIELD_SIZE-1 || dir == 'S' && y>0 || dir == 'E' && x<this.FIELD_SIZE-1 || dir == 'W' && x>0)
        &&(typeof this.arrows[x] !== 'undefined') && (typeof this.arrows[x][y] !== 'undefined')
        &&(this.arrows[x][y].owner == player)
        &&(this.arrows[x][y].direction != dir)){
            this.changeArrowDirection(x, y, dir);
            return true;
        }

    return false;
};

Game.prototype.changeArrowDirectionNextTurn = function(x, y, direction){
    this.arrowChangesNextTurnQueue.push({x:x, y:y, direction:direction});
};

Game.prototype.applyArrowChangesFromQueue = function(){
    for(var i=0; i<this.arrowChangesNextTurnQueue.length; i++){
        var arrowChange = this.arrowChangesNextTurnQueue[i];
        this.changeArrowDirection(arrowChange.x, arrowChange.y, arrowChange.direction);
    }

    this.arrowChangesNextTurnQueue = [];
};

Game.prototype.endGame = function(){
    this.stop();
    if(this.draw){
        return 0;
    } else {
        return this.winner;
    }
};

Game.prototype.logField = function(){
    var field = [];
    for(var i = 0; i < this.FIELD_SIZE; i++){
        field[i] = [];
        for(var j = 0; j < this.FIELD_SIZE; j++){
            field[i][j] = ".";
        }
    }
    
    for(i=0; i<this.balls.length; i++){
        var ball = this.balls[i];
        if(ball.owner == 1){
            field[this.FIELD_SIZE-1-ball.y][ball.x] = "1";
        } else if(ball.owner == 2){
            field[this.FIELD_SIZE-1-ball.y][ball.x] = "2";
        } else {
            field[this.FIELD_SIZE-1-ball.y][ball.x] = "?";
        }
    }
    
    console.log("Step " + this.currentStep);
    for(i = 0; i < this.FIELD_SIZE; i++){
        console.log(field[i].join(""));
    }
};


if(typeof exports !== 'undefined'){
    exports.Game = Game;
}
