var renderer = new PIXI.WebGLRenderer(1024, 768);
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var Game = require('./controller/GameController');

function app_init(next) {
    var game = new Game(9, 9);
    stage.addChild(game.getView());
    next();
};

function app_update() {
    requestAnimationFrame(app_update);
    stage.update();
    renderer.render(stage);
};

app_init(app_update);
