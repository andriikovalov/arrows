var Scene = function(game) {
    this.SCENE_SIZE_X = 900;
    this.SCENE_SIZE_Y = 600;
    this.FIELD_MARGIN_X = 50;
    this.FIELD_MARGIN_Y = 10;
    this.STEP_DURATION = game.STEP_DURATION;
    
    this.calculateArrowCoordinates(game.FIELD_SIZE);

    this.renderer = PIXI.autoDetectRenderer(this.SCENE_SIZE_X, this.SCENE_SIZE_Y, {backgroundColor : 0xffffff});
    document.body.appendChild(this.renderer.view);

    // create the root of the scene graph
    this.stage = new PIXI.Container();

    this.drawGrid(game.FIELD_SIZE);

    this.loadTextures();
    
    this.createFlagsAndArrows(game);
    this.createProvinces();

    this.addListenersToGame(game);
    
    this.balls = [];
    
    this.gameStopped = false;
    
    var baseStrengthTextOffset = 30;
    
    var player1BaseStrengthText = new PIXI.Text(game.player1BaseHealth);
    player1BaseStrengthText = new PIXI.Text(game.player1BaseHealth);
    player1BaseStrengthText.position.x = this.FIELD_MARGIN_X - baseStrengthTextOffset;
    player1BaseStrengthText.position.y = this.SCENE_SIZE_Y/2;
    player1BaseStrengthText.anchor.x = 0.5;
    player1BaseStrengthText.anchor.y = 0.5;
    this.stage.addChild(player1BaseStrengthText);

    var player2BaseStrengthText = new PIXI.Text(game.player2BaseHealth);
    player2BaseStrengthText.position.x = this.SCENE_SIZE_X - this.FIELD_MARGIN_X + baseStrengthTextOffset;
    player2BaseStrengthText.position.y = this.SCENE_SIZE_Y/2;
    player2BaseStrengthText.anchor.x = 0.5;
    player2BaseStrengthText.anchor.y = 0.5;
    this.stage.addChild(player2BaseStrengthText);
    
    this.playerBaseStrengthTexts = [null, player1BaseStrengthText, player2BaseStrengthText];
};

Scene.prototype.stop = function(){
    this.gameStopped = true;
};

Scene.prototype.animate = function(){
    if(!this.gameStopped){
        requestAnimationFrame(this.animate.bind(this));
    }

    for(var i=0; i<this.balls.length; i++){
        var ball = this.balls[i];
        var fractionOfStepPassed = (Date.now() - this.LAST_STEP_TIME) / this.STEP_DURATION;
        if (fractionOfStepPassed > 1) {
            fractionOfStepPassed = 1;
        }
        
        var nextBallGameX = ball.gamePosition.x;
        var nextBallGameY = ball.gamePosition.y;
        if(ball.gameDirection === 'N'){
            nextBallGameY++;
        }
        if(ball.gameDirection === 'S'){
            nextBallGameY--;
        }
        if(ball.gameDirection === 'E'){
            nextBallGameX++;
        }
        if(ball.gameDirection === 'W'){
            nextBallGameX--;
        }

        if((typeof this.arrowCoordinates[nextBallGameX] !== 'undefined') && (typeof this.arrowCoordinates[nextBallGameX][nextBallGameY] !== 'undefined')){
            var deltaX = this.arrowCoordinates[nextBallGameX][nextBallGameY].x - this.arrowCoordinates[ball.gamePosition.x][ball.gamePosition.y].x;
            var deltaY = this.arrowCoordinates[nextBallGameX][nextBallGameY].y - this.arrowCoordinates[ball.gamePosition.x][ball.gamePosition.y].y;

            ball.position.x = this.arrowCoordinates[ball.gamePosition.x][ball.gamePosition.y].x + deltaX * fractionOfStepPassed;
            ball.position.y = this.arrowCoordinates[ball.gamePosition.x][ball.gamePosition.y].y + deltaY * fractionOfStepPassed;
        }
    }

    this.renderer.render(this.stage);
};

Scene.prototype.calculateArrowCoordinates = function(fieldSize){
    var point_00 = {x:this.FIELD_MARGIN_X, y:this.SCENE_SIZE_Y/2};

    var cellSizeX = (this.SCENE_SIZE_X - 2*this.FIELD_MARGIN_X)/(fieldSize*2 - 2);
    var cellSizeY = (this.SCENE_SIZE_Y - 2*this.FIELD_MARGIN_Y)/(fieldSize*2 - 2);

    this.arrowCoordinates = [];
    for(var i=0; i<fieldSize; i++){
        this.arrowCoordinates[i] = [];
        var point_i0 = {x : point_00.x + cellSizeX*i, y: point_00.y + cellSizeY*i};
        for(var j=0; j<fieldSize; j++){
            this.arrowCoordinates[i][j] = {x : point_i0.x + cellSizeX*j, y: point_i0.y - cellSizeY*j};
        }
    }
};

Scene.prototype.drawGrid = function(fieldSize){
    var graphics = new PIXI.Graphics();

    graphics.lineStyle(4, 0xcccccc, 1);

    for(var i=0; i<fieldSize; i++){
        graphics.moveTo(this.arrowCoordinates[i][0].x, this.arrowCoordinates[i][0].y);
        graphics.lineTo(this.arrowCoordinates[i][fieldSize-1].x, this.arrowCoordinates[i][fieldSize-1].y);
    }
    for(i=0; i<fieldSize; i++){
        graphics.moveTo(this.arrowCoordinates[0][i].x, this.arrowCoordinates[0][i].y);
        graphics.lineTo(this.arrowCoordinates[fieldSize-1][i].x, this.arrowCoordinates[fieldSize-1][i].y);
    }
    this.stage.addChild(graphics);
};

Scene.prototype.loadTextures = function(){
    this.textures = {};
    this.textures.none_flag = PIXI.Texture.fromImage('images/flag_grey.png');
    this.textures.p1_flag = PIXI.Texture.fromImage('images/flag_red.png');
    this.textures.p2_flag = PIXI.Texture.fromImage('images/flag_blue.png');
    this.textures.arrow_n = PIXI.Texture.fromImage('images/arrow_n.png');
    this.textures.arrow_s = PIXI.Texture.fromImage('images/arrow_s.png');
    this.textures.arrow_e = PIXI.Texture.fromImage('images/arrow_e.png');
    this.textures.arrow_w = PIXI.Texture.fromImage('images/arrow_w.png');
    this.textures.p1_ball = PIXI.Texture.fromImage('images/ball_red.png');
    this.textures.p2_ball = PIXI.Texture.fromImage('images/ball_blue.png');
    this.textures.p1_province = PIXI.Texture.fromImage('images/province_red.png');
    this.textures.p2_province = PIXI.Texture.fromImage('images/province_blue.png');
};

Scene.prototype.createFlagsAndArrows = function(game){
    this.flags = [];
    this.arrows = [];
    for(var i = 0; i < game.FIELD_SIZE; i++){
        this.flags[i] = [];
        this.arrows[i] = [];
        for(var j = 0; j < game.FIELD_SIZE; j++){
            this.createArrowAt(i, j, game);
            this.createFlagAt(i, j, game);
        }
    }
};

Scene.prototype.createFlagAt = function(x, y, game){
    var texture;
    if(game.arrows[x][y].owner == 1){
        texture = this.textures.p1_flag;
    } else if(game.arrows[x][y].owner == 2){
        texture = this.textures.p2_flag;
    } else {
        texture = this.textures.none_flag;
    }

    var flag = new PIXI.Sprite(texture);

    flag.anchor.x = 0.5;
    flag.anchor.y = 0.5;
            
    flag.position.x = this.arrowCoordinates[x][y].x;
    flag.position.y = this.arrowCoordinates[x][y].y;

    this.flags[x][y] = flag;
    this.stage.addChild(flag);
};

Scene.prototype.createArrowAt = function(x, y, game){
    var texture;
    if(game.arrows[x][y].direction == 'N'){
        texture = this.textures.arrow_n;
    } else if(game.arrows[x][y].direction == 'S'){
        texture = this.textures.arrow_s;
    } else if(game.arrows[x][y].direction == 'E'){
        texture = this.textures.arrow_e;
    } else if(game.arrows[x][y].direction == 'W'){
        texture = this.textures.arrow_w;
    } else {
        texture = PIXI.Texture.EMPTY;
    }

    var arrow = new PIXI.Sprite(texture);

    arrow.anchor.x = 0.5;
    arrow.anchor.y = 0.5;
            
    arrow.position.x = this.arrowCoordinates[x][y].x;
    arrow.position.y = this.arrowCoordinates[x][y].y;

    arrow.gamePosition = {};
    arrow.gamePosition.x = x;
    arrow.gamePosition.y = y;
    arrow.gameOwner = game.arrows[x][y].owner;

    this.arrows[x][y] = arrow;
    this.stage.addChild(arrow);

    var onArrowDragStart = function (event) {
        if(this.gameOwner === currentPlayer){
            this.oldTexture = this.texture;
            this.data = event.data;
            this.alpha = 0.5;
            this.dragging = true;
        }
    };

    var textures = this.textures;
    var onArrowDragMove = function () {
        if (this.dragging)
        {
            this.newGameDirection = 'NONE';
            var newPosition = this.data.getLocalPosition(this);
            if(newPosition.x < 0 && newPosition.y < 0){
                this.newGameDirection = 'W';
                //this.texture = textures.arrow_w;
            }
            if(newPosition.x < 0 && newPosition.y > 0){
                this.newGameDirection = 'S';
                //this.texture = textures.arrow_s;
            }
            if(newPosition.x > 0 && newPosition.y < 0){
                this.newGameDirection = 'N';
                //this.texture = textures.arrow_n;
            }
            if(newPosition.x > 0 && newPosition.y > 0){
                this.newGameDirection = 'E';
                //this.texture = textures.arrow_e;
            }
        }
    };

    var onArrowDragEnd = function () {
        if (this.dragging && this.newGameDirection !== 'NONE')
        {
            Scene.notifyArrowChanged(this.gamePosition.x, this.gamePosition.y, this.newGameDirection);
            this.oldTexture = null;
            this.newGameDirection = null;
            this.alpha = 1;
            this.dragging = false;
            this.data = null;
        }
    };
    
    arrow.interactive = true;
    arrow
        // events for drag start
        .on('mousedown', onArrowDragStart)
        .on('touchstart', onArrowDragStart)
        // events for drag end
        .on('mouseup', onArrowDragEnd)
        .on('mouseupoutside', onArrowDragEnd)
        .on('touchend', onArrowDragEnd)
        .on('touchendoutside', onArrowDragEnd)
        // events for drag move
        .on('mousemove', onArrowDragMove)
        .on('touchmove', onArrowDragMove);
};

Scene.notifyArrowChanged = function(){
    console.warn('Scene.notifyArrowChanged function is supposed to be redefined');
};


Scene.prototype.createProvinces = function(){
    this.provinces = [];
    for(var i = 0; i < this.arrowCoordinates.length-1; i++){
        this.provinces[i] = [];
        for(var j = 0; j < this.arrowCoordinates.length-1; j++){
            this.provinces[i][j] = new PIXI.Sprite(PIXI.Texture.EMPTY);

            this.provinces[i][j].anchor.x = 0.5;
            this.provinces[i][j].anchor.y = 0.5;
            
            this.provinces[i][j].position.x = this.arrowCoordinates[i][j+1].x;
            this.provinces[i][j].position.y = this.arrowCoordinates[i][j].y;

            this.stage.addChild(this.provinces[i][j]);
        }
    }
};

Scene.prototype.updateFlag = function(x, y, newOwner){
    var newTexture;
    if(newOwner == 1){
        newTexture = this.textures.p1_flag;
    } else if(newOwner == 2){
        newTexture = this.textures.p2_flag;
    } else {
        newTexture = this.textures.none_flag;
    }

    this.arrows[x][y].gameOwner = newOwner;
    this.flags[x][y].texture = newTexture;
};

Scene.prototype.updateArrow = function(x, y, newDirection){
    var newTexture;
    if(newDirection == 'N'){
        newTexture = this.textures.arrow_n;
    } else if(newDirection == 'S'){
        newTexture = this.textures.arrow_s;
    } else if(newDirection == 'E'){
        newTexture = this.textures.arrow_e;
    } else if(newDirection == 'W'){
        newTexture = this.textures.arrow_w;
    } else {
        newTexture = PIXI.Texture.EMPTY;
    }

    this.arrows[x][y].texture = newTexture;
};

Scene.prototype.createBall = function(ball){
    var texture = (ball.owner == 1) ? this.textures.p1_ball : this.textures.p2_ball;
    var ballSprite = new PIXI.Sprite(texture);
    
    ballSprite.gameDirection = ball.direction;

    ballSprite.anchor.x = 0.5;
    ballSprite.anchor.y = 0.5;
    
    ballSprite.alpha = 0.5;
            
    ballSprite.position.x = this.arrowCoordinates[ball.x][ball.y].x;
    ballSprite.position.y = this.arrowCoordinates[ball.x][ball.y].y;
    
    ballSprite.gamePosition = {};
    ballSprite.gamePosition.x = ball.x;
    ballSprite.gamePosition.y = ball.y;

    var sizeMultiplier = Math.sqrt(ball.strength);
    ballSprite.scale.x = sizeMultiplier;
    ballSprite.scale.y = sizeMultiplier;

    this.balls.push(ballSprite);
    this.stage.addChild(ballSprite);
};

Scene.prototype.updateBallsCoordinates = function(balls){
    for (var i = 0; i < balls.length; i++) {
        this.balls[i].gamePosition.x = balls[i].x;
        this.balls[i].gamePosition.y = balls[i].y;
    }
};

Scene.prototype.changeBallDirection = function(ballNumber, newDirection){
    this.balls[ballNumber].gameDirection = newDirection;
};

Scene.prototype.removeBallAtIndex = function(index){
    this.stage.removeChild(this.balls[index]);
    this.balls.splice(index, 1);
};

Scene.prototype.setBallStrength = function(ballIndex, newStrength){
    var sizeMultiplier = Math.sqrt(newStrength);
    this.balls[ballIndex].scale.x = sizeMultiplier;
    this.balls[ballIndex].scale.y = sizeMultiplier;
};

Scene.prototype.changeProvinceOwner = function(x, y, newOwner){
    var province = this.provinces[x][y];
    if (newOwner === 1) {
        province.texture = this.textures.p1_province;
    } else if (newOwner === 2) {
        province.texture = this.textures.p2_province;
    } else {
        province.texture = PIXI.Texture.EMPTY;
    }
};

Scene.prototype.endGame = function(winner){
    var text;
    if(winner === 0){
        text = "Draw";
    } else if(winner === 1) {
        text = "Red wins";
    } else if(winner === 2) {
        text = "Blue wins";
    }
    
    var textSprite = new PIXI.Text(text);
    this.stage.addChild(textSprite);
    this.stop();
};

Scene.prototype.setBaseStrength = function(playerNum, newStrength){
    this.playerBaseStrengthTexts[playerNum].text = newStrength;
};

Scene.prototype.addListenersToGame = function(game){
    var thisScene = this;
    var originalChangeArrowOwner = game.changeArrowOwner;
    game.changeArrowOwner = function(x, y, newOwner){
        originalChangeArrowOwner.call(game, x, y, newOwner);
        thisScene.updateFlag.call(thisScene, x, y, newOwner);
    };

    var originalChangeArrowDirection = game.changeArrowDirection;
    game.changeArrowDirection = function(x, y, newDirection){
        originalChangeArrowDirection.call(game, x, y, newDirection);
        thisScene.updateArrow.call(thisScene, x, y, newDirection);
    };

    var originalAddBall = game.addBall;
    game.addBall = function(ball){
        originalAddBall.call(game, ball);
        thisScene.createBall.call(thisScene, ball);
    };

    var originalMoveBalls = game.moveBalls;
    game.moveBalls = function(){
        originalMoveBalls.call(game);
        thisScene.updateBallsCoordinates.call(thisScene, game.balls);
    };
    
    var originalGameStep = game.step;
    game.step = function(){
        originalGameStep.call(game);
        thisScene.LAST_STEP_TIME = Date.now();
    };

    var originalChangeBallDirection = game.changeBallDirection;
    game.changeBallDirection = function(ballNumber, newDirection){
        originalChangeBallDirection.call(game, ballNumber, newDirection);
        thisScene.changeBallDirection.call(thisScene, ballNumber, newDirection);
    };

    var originalRemoveBallAtIndex = game.removeBallAtIndex;
    game.removeBallAtIndex = function(index){
        originalRemoveBallAtIndex.call(game, index);
        thisScene.removeBallAtIndex.call(thisScene, index);
    };

    var originalSetBallStrength = game.setBallStrength;
    game.setBallStrength = function(ballIndex, newStrength){
        originalSetBallStrength.call(game, ballIndex, newStrength);
        thisScene.setBallStrength.call(thisScene, ballIndex, newStrength);
    };
    
    var originalChangeProvinceOwner = game.changeProvinceOwner;
    game.changeProvinceOwner = function(x, y, newOwner){
        originalChangeProvinceOwner.call(game, x, y, newOwner);
        thisScene.changeProvinceOwner.call(thisScene, x, y, newOwner);
    };

    var originalEndGame = game.endGame;
    game.endGame = function(){
        var winner = originalEndGame.call(game);
        thisScene.endGame.call(thisScene, winner);
    };
    
    var originalSetBaseStrength = game.setBaseStrength;
    game.setBaseStrength = function(playerNum, newStrength){
        originalSetBaseStrength.call(game, playerNum, newStrength);
        thisScene.setBaseStrength.call(thisScene, playerNum, newStrength);
    };
};