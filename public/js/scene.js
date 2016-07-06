var Scene = function(game) {
    this.SCENE_SIZE_X = 800;
    this.SCENE_SIZE_Y = 600;
    this.FIELD_MARGIN_X = 80;
    this.FIELD_MARGIN_Y = 60;

    this.calculateArrowCoordinates(game.FIELD_SIZE);

    this.renderer = PIXI.autoDetectRenderer(this.SCENE_SIZE_X, this.SCENE_SIZE_Y, {backgroundColor : 0xffffff});
    document.body.appendChild(this.renderer.view);

    // create the root of the scene graph
    this.stage = new PIXI.Container();

    this.drawGrid(game.FIELD_SIZE);

    this.loadTextures();
    
    this.createFlagsAndArrows(game);

    this.addListenersToGame(game);
    
    this.balls = [];
};

Scene.prototype.animate = function(){
    requestAnimationFrame(this.animate.bind(this));

    // render the container
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

    for(i=0; i<fieldSize; i++){
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
}

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

    this.arrows[x][y] = arrow;
    this.stage.addChild(arrow);
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
    
    ballSprite.ballDirection = ball.direction;

    ballSprite.anchor.x = 0.5;
    ballSprite.anchor.y = 0.5;
    
    ballSprite.alpha = 0.5;
            
    ballSprite.position.x = this.arrowCoordinates[ball.x][ball.y].x;
    ballSprite.position.y = this.arrowCoordinates[ball.x][ball.y].y;

    this.balls.push(ballSprite);
    this.stage.addChild(ballSprite);
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
};