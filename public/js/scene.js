var Scene = function() {
    this.renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0xffffff});
    document.body.appendChild(this.renderer.view);

    var graphics = new PIXI.Graphics();

    graphics.lineStyle(4, 0xcccccc, 1);
    graphics.moveTo(80,300);
    graphics.lineTo(400, 60);
    graphics.lineTo(720, 300);
    graphics.lineTo(400, 540);
    graphics.lineTo(80,300);

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
}