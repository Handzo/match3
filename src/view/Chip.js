var Shape  = require('./../GameEnum').Shape;
var GameEvents = require('./../GameEvents');

function Chip(row, col, shape) {

    PIXI.Graphics.call(this);

    this.row = row;
    this.col = col;
    this.type = shape;

    this.shape = new PIXI.Graphics();
    switch(shape) {
    case Shape.SQUARE:
        this.shape.beginFill(0xF44B42);
        this.shape.drawRect(-20, -20, 40, 40);
        break;
    case Shape.TRIANGLE:
        this.shape.beginFill(0x4FF441);
        this.shape.moveTo(-20, 20);
        this.shape.lineTo(20, 20);
        this.shape.lineTo(0, -20);
        this.shape.closePath();
        break;
    case Shape.CIRCLE:
        this.shape.beginFill(0x41B2F4);
        this.shape.drawCircle(0, 0, 20);
        break;
    default:
        return;
        break;
    }
    this.shape.endFill();
    this.shape.x = 30;
    this.shape.y = 30;
    this.shape.anchor.x = 0.5;
    this.shape.anchor.y = 0.5;
    this.addChild(this.shape);

    this.interactive = true;
    this.on('mousedown',  this.onClick, this);
    this.on('touchstart', this.onClick, this);
}

Chip.prototype = Object.create(PIXI.Container.prototype);
Chip.prototype.constructor = Chip;

Chip.prototype.getShape = function() {
    return this.type;
};

Chip.prototype.onClick = function() {
    this.emit(GameEvents.CHIP_CLICKED, {row: this.row, col: this.col, shape: this.type});
};

Chip.prototype.select = function() {
    this.shape.scale = {x: 1.2, y: 1.2};
};

Chip.prototype.unselect = function() {
    this.shape.scale = {x: 1, y: 1};
};

Chip.prototype.hide = function() {

    this.shape.addTween(new PIXI.Tween({rotation: 360}, {duration: 1000, repeat: -1}));
    var queue = new PIXI.TweenQueue();
    queue.add(new PIXI.Tween({scale: {x: 1.2, y: 1.2}}, {duration: 150}));
    queue.add(new PIXI.Tween({scale: {x: 0, y: 0}}, {duration: 300}));
    this.shape.addTween(queue);
    return queue;
};

module.exports = Chip;
