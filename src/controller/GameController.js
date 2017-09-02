var GameModel  = require('./../model/GameModel');
var GameView   = require('./../view/GameView');
var GameEvents = require('./../GameEvents');
var State      = require('./../GameEnum').State;

function GameController(rows, cols) {

    this.state = null;
    this.first = null;  // first chip to swap
    this.second = null; // second chip to swap

    this.model = new GameModel(rows, cols);

    this.view = new GameView(rows, cols);
    this.view.x = (1024 - this.view.width) / 2;
    this.view.y = (768  - this.view.height) / 2;

    this.view.on(GameEvents.CHIP_CLICKED, this.onChipClicked, this);

    this.setChips();
    this.setState(State.Idle);
}

GameController.prototype.getView = function() {
    return this.view;
};

GameController.prototype.setState = function(state) {
    this.state = state;
};

GameController.prototype.setChips = function() {

    this.view.clear();
    var chips = this.model.chips;
    for (var row = 0; row < chips.length; ++row)
        for (var col = 0; col < chips[row].length; ++col)
            this.view.setChip(row, col, chips[row][col]);
};

GameController.prototype.onChipClicked = function(data) {

    if (this.state === State.Idle) {
        this.first = data;
        this.view.selectChip(data);
        this.setState(State.PickSecond);
    }
    else if (this.state === State.PickSecond) {
        var dx = Math.abs(this.first.row - data.row);
        var dy = Math.abs(this.first.col - data.col);
        if (dx > 1 || dy > 1 || dx == dy) {
            this.view.unselectChip(this.first);
            this.view.selectChip(data);
            this.first = data;
        }
        else {
            this.view.unselectChip(this.first);
            this.second = data;
            this.swap();
        }
    }
};

GameController.prototype.swap = function() {

    this.setState(State.Swap);
    this.model.swap(this.first, this.second);

    var swapTween = this.view.swap(this.first, this.second);
    swapTween.on(PIXI.TweenEvent.COMPLETE, this.checkResult, this);
};

GameController.prototype.checkResult = function() {

    var matches = this.model.getMatches();

    if (matches.length)
        this.removeMatches(matches);
    else if (this.first && this.second)
        this.reverseSwap();
    else if (!this.model.checkPossibilities())
        this.shuffle();
    else
        this.setState(State.Idle);
};

GameController.prototype.shuffle = function() {

    while (!this.model.checkPossibilities())
        this.model.shuffle();

    var chips = [];
    for (var row = 0; row < this.view.chips.length; ++row)
        chips = chips.concat(this.view.chips[row]);

    var lastTween = null;
    for (var row = 0; row < this.model.rows; ++row) {
        for (var col = 0; col < this.model.cols; ++col) {
            var i = -1;
            while (chips[++i].getShape() !== this.model.chips[row][col]) {}
            var coords = this.view.getCoords(row, col);
            lastTween = chips[i].addTween(new PIXI.Tween({x: coords.x, y: coords.y}, {duration: 1000}));
            chips.splice(i, 1);
        }
    }

    lastTween.on(PIXI.TweenEvent.COMPLETE, function() {
        this.setChips();
        this.setState(State.Idle);
    }, this);
};

GameController.prototype.removeMatches = function(matches) {

    this.first = null;
    this.second = null;
    this.view.scores.text = 'Scores ' + this.model.scores;
    var removeTween = this.view.remove(matches);
    if (removeTween) {
        removeTween.on(PIXI.TweenEvent.COMPLETE, function() {
            this.model.generateNext(matches);
            this.animate(matches);
        }, this);
    }
};

GameController.prototype.reverseSwap = function() {

    this.model.swap(this.first, this.second);
    this.view.swap(this.first, this.second).on(PIXI.TweenEvent.COMPLETE, function() {
        this.setState(State.Idle);
    }, this);
};

GameController.prototype.animate = function(matches) {

    this.setChips();

    var longest = 1;
    for (var col = 0; col < matches.length; ++col) {
        var length = matches[col].length;
        if (length) {
            var shift = 1;
            var nextRow = matches[col][length - shift - 1];
            for (var row = matches[col][length - 1]; row >= 0; --row) {
                var prevRow = row - 1;
                while (prevRow === nextRow) {
                    shift++;
                    --prevRow;
                    nextRow = matches[col][length - shift - 1];
                }

                this.view.animate(row, col, shift);
                longest = Math.max(longest, shift);
            }
        }
    }

    this.view.addTween(new PIXI.TweenDummy(longest * 300)).on(PIXI.TweenEvent.COMPLETE, this.checkResult, this);
};

module.exports = GameController;
