jewel.screens["game-screen"] = (function () {
    var firstRun = true;

    function startGame() {
        var board = jewel.board
            , display = jewel.display;
        board.initialize(function () {
            display.initialize(function () {
                display.redraw(board.getBoard(), function () {
                    // do nothing for now
                })
            });
        });
    }

    function setup() {
        // do nothing for now
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
        }
        startGame();
    }

    return {
        run: run
    };
})();