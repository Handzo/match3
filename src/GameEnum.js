var State = {};
State.Idle = 0;
State.PickSecond = 1;
State.Swap = 2;

var Shape = {};
Shape.SQUARE   = 0;
Shape.TRIANGLE = 1;
Shape.CIRCLE   = 2;
Shape.LAST     = 3;

module.exports = {
    State: State,
    Shape: Shape
};
