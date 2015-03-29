jewel.screens["game-screen"] = (function () {
    var firstRun = true
        , paused
        , dom = jewel.dom
        , overlay = dom.$("#game-screen .pause-overlay")[0];

    function startGame() {
        var board = jewel.board
            , display = jewel.display;
        board.initialize(function () {
            display.initialize(function () {
                display.redraw(board.getBoard(), function () {
                    // do nothing for now
                });
            });
        });
        paused = false;
        overlay.style.display = "none";
    }

    function setup() {
        dom.bind("footer button.exit", "click", exitGame);
        dom.bind("footer button.pause", "click", pauseGame);
        dom.bind(".pause-overlay", "click", resumeGame);
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
        }
        startGame();
    }

    function pauseGame() {
        if (paused) {
            return;
        }
        paused = true;
        overlay.style.display = "block";
    }

    function resumeGame() {
        paused = false;
        overlay.style.display = "none";
    }

    function exitGame() {
        pauseGame();
        var confirmed = window.confirm("Do you want to return to the main menu?");
        if (confirmed) {
            jewel.showScreen("main-menu");
        } else {
            resumeGame();
        }
    }

    return {
        run: run
    };
})();