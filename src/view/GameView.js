var GameEvents = require('./../GameEvents');
var Chip       = require('./Chip');

function GameView (rows, cols) {
    PIXI.Container.call(this);

    this.cellWidth  = 60;
    this.cellHeight = 60;
    this.padding    = 5;
    this.chips      = [];

    var  bColor     = 0x8C8C8C;

    this.board = new PIXI.Container();
    this.addChild(this.board);

    // clip mask
    var mask = new PIXI.Graphics();
    mask.beginFill(0xFF0000);
    mask.drawRect(0, 0, (this.cellWidth + this.padding) * cols, (this.cellHeight + this.padding) * rows);
    mask.endFill();
    mask.attachTo(this);

    this.board.mask = mask;

    for (var row = 0; row < rows; ++row) {
        this.chips.push(new Array(cols));
        for (var col = 0; col < cols; ++col) {
            var cell = new PIXI.Graphics();
            cell.beginFill(bColor);
            cell.drawRect(0, 0, this.cellWidth, this.cellHeight);
            cell.endFill();
            cell.position = this.getCoords(row, col);
            this.board.addChild(cell);
        }
    }

    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 30,
        fill: 0xFFFFFF
    });
    this.scores = new PIXI.Text('Scores 0', style);
    this.scores.x = this.width / 2;
    this.scores.y = this.height + 25;
    this.scores.anchor = {x: 0.5, y: 0.5};
    this.addChild(this.scores);
};

GameView.prototype = Object.create(PIXI.Container.prototype);
GameView.prototype.constructor = GameView;

GameView.prototype.getCoords = function(row, col) {
    return {x: col * (this.cellWidth + this.padding), y: row * (this.cellHeight + this.padding)};
};

GameView.prototype.setChip = function(row, col, shape) {

    var chip = new Chip(row, col, shape);
    chip.x = col * (this.cellWidth  + this.padding);
    chip.y = row * (this.cellHeight + this.padding);
    chip.on(GameEvents.CHIP_CLICKED, this.onChipClicked, this);

    this.chips[row][col] = chip;
    this.board.addChild(chip);
};

GameView.prototype.clear = function() {

    for (var row = 0; row < this.chips.length; ++row) {
        for (var col = 0; col < this.chips[row].length; ++col) {
            if (this.chips[row][col]) {
                this.chips[row][col].removeAllListeners();
                this.chips[row][col].detach();
                this.chips[row][col] = null;
            }
        }
    }
};

GameView.prototype.getChip = function(data) {
    return this.chips[data.row][data.col];
};

GameView.prototype.onChipClicked = function(event) {
    this.emit(GameEvents.CHIP_CLICKED, event);
};

GameView.prototype.selectChip = function(data) {
    this.chips[data.row][data.col].select();
};

GameView.prototype.unselectChip = function(data) {
    this.chips[data.row][data.col].unselect();
};

GameView.prototype.swap = function(first, second) {

    // swap two chips with animation
    var firstChip  = this.getChip(first),
        secondChip = this.getChip(second),
        duration = 300;

    this.chips[first.row][first.col]   = secondChip;
    this.chips[second.row][second.col] = firstChip;

    this.unselectChip(first);
    this.unselectChip(second);

    firstChip.addTween(new PIXI.Tween({x: secondChip.x, y: secondChip.y}, {duration: duration}));
    return secondChip.addTween(new PIXI.Tween({x: firstChip.x, y: firstChip.y}, {duration: duration}));
};

GameView.prototype.remove = function(matches) {

    // chip disappear animation
    var lastTween = null;

    for (var col = 0; col < matches.length; ++col)
        for (var i = 0; i < matches[col].length; ++i)
            lastTween = this.chips[matches[col][i]][col].hide();

    return lastTween;
};

GameView.prototype.animate = function(row, col, shift) {

    // slide chip animation
    var chip = this.chips[row][col];
    var origY = chip.y;
    chip.y -= shift * (this.cellHeight + this.padding);
    chip.addTween(new PIXI.Tween({y: origY}, {duration: shift * 300}));
};

module.exports = GameView;
