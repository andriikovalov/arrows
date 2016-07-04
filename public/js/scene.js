var Scene = function(game) {
    this.SCENE_SIZE_X = 800;
    this.SCENE_SIZE_Y = 600;
    this.FIELD_MARGIN_X = 80;
    this.FIELD_MARGIN_Y = 60;
    
    var point_00 = {x:this.FIELD_MARGIN_X, y:this.SCENE_SIZE_Y/2};

    var cellSizeX = (this.SCENE_SIZE_X - 2*this.FIELD_MARGIN_X)/(game.FIELD_SIZE*2 - 2);
    var cellSizeY = (this.SCENE_SIZE_Y - 2*this.FIELD_MARGIN_Y)/(game.FIELD_SIZE*2 - 2);

    this.arrowCoordinates = [];
    for(var i=0; i<game.FIELD_SIZE; i++){
        this.arrowCoordinates[i] = [];
        var point_i0 = {x : point_00.x + cellSizeX*i, y: point_00.y + cellSizeY*i};
        for(var j=0; j<game.FIELD_SIZE; j++){
            this.arrowCoordinates[i][j] = {x : point_i0.x + cellSizeX*j, y: point_i0.y - cellSizeY*j};
        }
    }

    this.renderer = PIXI.autoDetectRenderer(this.SCENE_SIZE_X, this.SCENE_SIZE_Y, {backgroundColor : 0xffffff});
    document.body.appendChild(this.renderer.view);

    var graphics = new PIXI.Graphics();

    graphics.lineStyle(4, 0xcccccc, 1);

    for(i=0; i<game.FIELD_SIZE; i++){
        graphics.moveTo(this.arrowCoordinates[i][0].x, this.arrowCoordinates[i][0].y);
        graphics.lineTo(this.arrowCoordinates[i][game.FIELD_SIZE-1].x, this.arrowCoordinates[i][game.FIELD_SIZE-1].y);
    }
    for(i=0; i<game.FIELD_SIZE; i++){
        graphics.moveTo(this.arrowCoordinates[0][i].x, this.arrowCoordinates[0][i].y);
        graphics.lineTo(this.arrowCoordinates[game.FIELD_SIZE-1][i].x, this.arrowCoordinates[game.FIELD_SIZE-1][i].y);
    }

    // create the root of the scene graph
    this.stage = new PIXI.Container();

    // create a texture from an image path
    var texture = PIXI.Texture.fromImage('https://pixijs.github.io/examples/_assets/basics/bunny.png');

    // create a new Sprite using the texture
    this.bunny = new PIXI.Sprite(texture);

    // center the sprite's anchor point
    this.bunny.anchor.x = 0.5;
    this.bunny.anchor.y = 0.5;

    // move the sprite to the center of the screen
    this.bunny.position.x = 200;
    this.bunny.position.y = 150;

    this.stage.addChild(this.bunny);
    this.stage.addChild(graphics);
};

Scene.prototype.animate = function(){
    requestAnimationFrame(this.animate.bind(this));

    // just for fun, let's rotate mr rabbit a little
    this.bunny.rotation += 0.1;

    // render the container
    this.renderer.render(this.stage);
};
