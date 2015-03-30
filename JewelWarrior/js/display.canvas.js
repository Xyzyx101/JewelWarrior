jewel.display = (function () {
    var canvas
        , ctx
        , cols
        , rows
        , jewelSize
        , firstRun = true
        , jewelSprite
        , jewels
        , cursor
        , previousCycle
        , animations = [];

    function setup() {
        var $ = jewel.dom.$
        , boardElement = $("#game-screen .game-board")[0];
        cols = jewel.settings.cols;
        rows = jewel.settings.rows;
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        jewel.dom.addClass(canvas, "board");
        var rect = boardElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        jewelSize = rect.width / cols;
        boardElement.appendChild(createBackground());
        boardElement.appendChild(canvas);
        previousCycle = Date.now();
        requestAnimationFrame(cycle);
    }

    function cycle() {
        var time = Date.now();
        if (animations.length === 0) {
            renderCursor(time);
        }
        renderAnimations(time, previousCycle);
        previousCycle = time;
        requestAnimationFrame(cycle);
    }

    function initialize(callback) {
        if (firstRun) {
            setup();
            jewelSprite = new Image();
            jewelSprite.addEventListener("load", callback, false);
            jewelSprite.src = "images/jewels" + jewelSize + ".png";
            firstRun = false;
        }
        callback();
    }

    function createBackground() {
        var background = document.createElement("canvas")
            , bgctx = background.getContext("2d");
        jewel.dom.addClass(background, "background");
        background.width = cols * jewelSize;
        background.height = rows * jewelSize;
        bgctx.fillStyle = "rgba(255, 255, 0, 0.08)";
        for (var x = 0; x < cols; ++x) {
            for (var y = 0; y < rows; ++y) {
                if ((x + y) % 2) {
                    bgctx.fillRect(
                        x * jewelSize
                        , y * jewelSize
                        , jewelSize
                        , jewelSize
                    );
                }
            }
        }
        return background;
    }

    function drawJewel(type, x, y, scale, rot) {
        ctx.save();
        if (typeof scale !== "undefined" && scale > 0) {
            ctx.beginPath();
            ctx.translate(
                (x + 0.5) * jewelSize
                , (y + 0.5) * jewelSize
            );
            ctx.scale(scale, scale);
            if (rot) {
                ctx.rotate(rot);
            }
            ctx.translate(
                -(x + 0.5) * jewelSize
                , -(y + 0.5) * jewelSize
            );
            
        }
        ctx.drawImage(
            jewelSprite
            , type * jewelSize
            , 0
            , jewelSize
            , jewelSize
            , x * jewelSize
            , y * jewelSize
            , jewelSize
            , jewelSize
        );
        ctx.restore();
    }

    function redraw(newJewels, callback) {
        jewels = newJewels;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var x = 0; x < cols; ++x) {
            for (var y = 0; y < rows; ++y) {
                drawJewel(jewels[x][y], x, y);
            }
        }
        renderCursor();
        callback();
    }

    function renderCursor(time) {
        if (!cursor) {
            return;
        }
        var x = cursor.x
            , y = cursor.y
            , t1 = (Math.sin(time / 200) + 1) / 2
            , t2 = (Math.sin(time / 400) + 1) / 2;

        clearCursor();

        if (cursor.selected) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.8 * t1;
            drawJewel(jewels[x][y], x, y);
            ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 0.05 * jewelSize;
        ctx.strokeStyle = "rgba(250,250,150," + (0.5 + 0.5 * t2) + ")";
        ctx.strokeRect(
            (x + 0.05) * jewelSize
            , (y + 0.05) * jewelSize
            , 0.9 * jewelSize
            , 0.9 * jewelSize
        );
        ctx.restore();
    }

    function clearCursor() {
        if (cursor) {
            var x = cursor.x
                , y = cursor.y;
            clearJewel(x, y);
            drawJewel(jewels[x][y], x, y);
        }
    }

    function setCursor(x, y, selected) {
        clearCursor();
        if (arguments.length > 0) {
            cursor = {
                x: x
                , y: y
                , selected: selected
            };
        } else {
            cursor = null;
        }
        renderCursor();
    }

    function clearJewel(x, y) {
        ctx.clearRect(
            x * jewelSize
            , y * jewelSize
            , jewelSize
            , jewelSize
        );
    }

   function moveJewels(movedJewels, callback) {
        var n = movedJewels.length
            , oldCursor = cursor;
        cursor = null;
        movedJewels.forEach(function (e) {
            var x = e.fromX
                , y = e.fromY
                , dx = e.toX - e.fromX
                , dy = e.toY - e.fromY
                , dist = Math.abs(dx) + Math.abs(dy);
            addAnimation(200 * dist, {
                before: function (pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    clearJewel(x + dx * pos, y + dy * pos);
                }
                , render: function (pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    drawJewel(
                        e.type
                        , x + dx * pos
                        , y + dy * pos
                    );
                }
                , done: function () {
                    if (--n == 0) {
                        cursor = oldCursor;
                        callback();
                    }
                }
            });
        });
    }

    function removeJewels(removedJewels, callback) {
        var n = removedJewels.length;
        removedJewels.forEach(function (e) {
            addAnimation(400, {
                before: function () {
                    clearJewel(e.x, e.y);
                }
                , render: function (pos) {
                    ctx.save();
                    ctx.globalAlpha = 1 - pos;
                    drawJewel(
                        e.type
                        , e.x
                        , e.y
                        , 1 - pos
                        , pos * Math.PI * 2
                    );
                    ctx.restore();
                }
                , done: function () {
                    if (--n == 0) {
                        callback();
                    }
                }
            });
        });
    }

    function refill(newJewels, callback) {
        var lastJewel = 0;
        addAnimation(1000, {
            render: function (pos) {
                var thisJewel = Math.floor(pos * cols * rows)
                    , i
                    , x
                    , y;
                for (i = lastJewel; i < thisJewel; ++i) {
                    x = i % cols;
                    y = Math.floor(i / cols);
                    clearJewel(x, y);
                    drawJewel(newJewels[x][y], x, y);
                }
                lastJewel = thisJewel
                jewel.dom.transform(canvas, "rotateX(" + (360 * pos) + "deg)");
            }
            , done: function () {
                //canvas.style.webkitTransform = "";
                jewel.dom.transform(canvas, "rotateX(0)")
                callback();
            }
        });
    }

    function addAnimation(runTime, fncs) {
        var anim = {
            runTime: runTime
            , startTime: Date.now()
            , pos: 0
            , fncs: fncs
        };
        animations.push(anim);
    }

    function renderAnimations(time, lastTime) {
        var anims = animations.slice(0)
            , animTime
            , anim
            , i;

        // call before() 
        for (i = 0; i < anims.length; ++i) {
            anim = anims[i];
            if (anim.fncs.before) {
                anim.fncs.before(anim.pos);
            }
            anim.lastPos = anim.pos;
            animTime = (lastTime - anim.startTime);
            anim.pos = animTime / anim.runTime;
            anim.pos = Math.max(0, Math.min(1, anim.pos));
        }

        // reset animation list
        animations = [];
        for (i = 0; i < anims.length; ++i) {
            anim = anims[i];
            anim.fncs.render(anim.pos, anim.pos - anim.lastPos);
            if (anim.pos === 1) {
                if (anim.fncs.done) {
                    anim.fncs.done();
                }
            } else {
                animations.push(anim);
            }
        }
    }

    return {
        initialize: initialize
        , redraw: redraw
        , setCursor: setCursor
        , moveJewels: moveJewels
        , removeJewels: removeJewels
        , refill: refill
    };
})();