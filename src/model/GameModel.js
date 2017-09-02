var Shape = require('./../GameEnum').Shape;

function GameModel(rows, cols)
{
    this.rows = rows;
    this.cols = cols;
    this.matchLength = 3;
    this.scores = 0;

    this.table = {};
    this.table[Shape.SQUARE] = 10;
    this.table[Shape.TRIANGLE] = 20;
    this.table[Shape.CIRCLE] = 30;

    this.chips = null;

    //randomize initial board
    this.init();
}

GameModel.prototype.init = function() {

    this.chips = [];

    for (var row = 0; row < this.rows; ++row) {
        this.chips.push(new Array(this.cols));
        for (var col = 0; col < this.cols; ++col) {

            // generate random shape while board has matches
            do
                this.chips[row][col] = Math.floor(Math.random() * Shape.LAST);
            while (this.getMatchLength(row, col, {x: -1, y: 0}) >= this.matchLength ||
                   this.getMatchLength(row, col, {x: 0, y: -1}) >= this.matchLength);
        }
    }

    while (!this.checkPossibilities())
        this.shuffle();
};

GameModel.prototype.getMatchLength = function(row, col, direction) {

    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols)
        return 0;

    // check match in pointed direction
    var shape = this.chips[row][col];
    var matchLength = 0;

    do
    {
        matchLength++;
        row += direction.y;
        col += direction.x;
    } while (this.chips[row] !== undefined &&
             this.chips[row][col] === shape);

    return matchLength;
};

GameModel.prototype.swap = function(first, second) {
    var temp = this.chips[first.row][first.col];
    this.chips[first.row][first.col] = this.chips[second.row][second.col];
    this.chips[second.row][second.col] = temp;
};

GameModel.prototype.generateNext = function(matches) {

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

                if (row < length)
                    this.chips[row][col] = Math.floor(Math.random() * Shape.LAST);
                else
                    this.chips[row][col] = this.chips[row - shift][col];
            }
        }
    }
};

GameModel.prototype.shuffle = function() {

    this.shuffleRows();
    this.chips = this.transposeBoard();
    this.shuffleRows();

    var tmpRow, tmpCol;

    for (var row = 0; row < this.rows; ++row) {
        for (var col = 0; col < this.cols; ++col) {

            while (this.isMatchChip(row, col)) {
                tmpRow = Math.floor(Math.random() * this.rows);
                tmpCol = Math.floor(Math.random() * this.cols);

                this.swap({row: row, col: col}, {row: tmpRow, col: tmpCol});
                if (this.isMatchChip(row, col) || this.isMatchChip(tmpRow, tmpCol))
                    this.swap({row: row, col: col}, {row: tmpRow, col: tmpCol});
                else {
                    break;
                }
            }
        }
    }
};

GameModel.prototype.isMatchChip = function(row, col) {

    var horLength = this.getMatchLength(row, col, {x: -1, y: 0}) + this.getMatchLength(row, col, {x: 1, y: 0}) - 1;
    var verLength = this.getMatchLength(row, col, {x: 0, y: -1}) + this.getMatchLength(row, col, {x: 0, y: 1}) - 1;
    return horLength >= this.matchLength || verLength >= this.matchLength;
};

GameModel.prototype.shuffleRows = function() {

    var i = this.chips.length;
    var temp, j;

    while (i) {
        j = Math.floor(Math.random() * i--);
        temp = this.chips[i];
        this.chips[i] = this.chips[j];
        this.chips[j] = temp;
    }
};

GameModel.prototype.transposeBoard = function() {

    return this.chips[0].map(function(col, i) {
        return this.chips.map(function(row) {
            return row[i];
        }, this);
    }, this);
};

GameModel.prototype.getHorizontalMatches = function() {

    var matches = [];

    for (var row = 0; row < this.rows; ++row) {

        var buffer = [];
        var shape = this.chips[row][0];
        for (var col = 0; col < this.cols; ++col) {
            if (shape === this.chips[row][col]) {
                buffer.push({row: row, col: col});
            }
            else {
                if (buffer.length >= this.matchLength) {
                    this.scores += this.table[shape];
                    Array.prototype.push.apply(matches, buffer);
                }
                buffer = [{row: row, col: col}];
                shape = this.chips[row][col];
            }

            if (buffer.length >= this.matchLength && col === this.cols - 1) {
                this.scores += this.table[shape];
                Array.prototype.push.apply(matches, buffer);
            }
        }
    }
    return matches;
};

GameModel.prototype.getVerticalMatches = function() {

    var matches = [];

    for (var col = 0; col < this.cols; ++col) {

        var buffer = [];
        var shape = this.chips[0][col];
        for (var row = 0; row < this.rows; ++row) {
            if (shape === this.chips[row][col]) {
                buffer.push({row: row, col: col});
            }
            else {
                if (buffer.length >= this.matchLength) {
                    this.scores += this.table[shape];
                    Array.prototype.push.apply(matches, buffer);
                }
                buffer = [{row: row, col: col}];
                shape = this.chips[row][col];
            }

            if (buffer.length >= this.matchLength && row == this.rows - 1) {
                this.scores += this.table[shape];
                Array.prototype.push.apply(matches, buffer);
            }
        }
    }
    return matches;
};

GameModel.prototype.getMatches = function() {

    var matches = this.getHorizontalMatches();
    matches = matches.concat(this.getVerticalMatches());

    if (matches.length) {
        var result = new Array();
        for (var i = 0; i < this.cols; ++i) {
            result.push(new Array());
        }

        matches.forEach(function(match) {
            if (result[match.col].indexOf(match.row) === -1)
                result[match.col].push(match.row);
        });

        result.forEach(function(column) {
            column.sort();
        });

        // get all matches in array of sorted rows in each column

        return result;
    }
    else {
        return [];
    }
};

GameModel.prototype.checkPossibilities = function() {

    for (var row = 0; row < this.rows; ++row) {
        for (var col = 0; col < this.cols; ++col) {

            if (this.checkMatch(row, col, {x: 1, y: 0}, [{x: -2, y: 0}, {x: -1, y: -1}, {x: -1, y: 1}, {x: 2, y: -1}, {x: 3, y: 0}, {x: 2, y: 1}]))
                return true;

            if (this.checkMatch(row, col, {x: 2, y: 0}, [{x: 1, y: -1}, {x: 1, y: 1}]))
                return true;

            if (this.checkMatch(row, col, {x: 0, y: 1}, [{x: 0, y: -2}, {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 2}, {x: 1, y: 2}, {x: 0, y: 3}]))
                return true;

            if (this.checkMatch(row, col, {x: 0, y: 2}, [{x: -1, y: 1}, {x: 1, y: 1}]))
                return true;
        }
    }

    return false;
};

GameModel.prototype.checkMatch = function(row, col, mustHave, points) {

    // check if 'mustHave' chips has same shape
    if (!this.isMatch(row, col, mustHave))
        return false;

    // if at least one possible point has same shape, board has match move
    for (var i = 0; i < points.length; ++i)
        if (this.isMatch(row, col, points[i]))
            return true;

    return false;
};

GameModel.prototype.isMatch = function(row, col, cell) {

    var newRow = row + cell.y,
        newCol = col + cell.x;

    return newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols &&
           this.chips[row][col] === this.chips[newRow][newCol];
};

module.exports = GameModel;
