var jewel = (function () {
    "use strict";
    var scriptQueue = []
            , numResources = 0
            , numResourcesLoaded = 0
            , executeRunning = false;

    function load(src, callback) {
        var queueEntry = {
            src: src,
            callback: callback,
            loaded: false
        };
        ++numResources;
        scriptQueue.push(queueEntry);
        var image = new Image();
        image.onload = image.onerror = function () {
            ++numResourcesLoaded;
            queueEntry.loaded = true;
            if (!executeRunning) {
                executeScriptQueue();
            }
        };
        image.src = src;
    }

    function executeScriptQueue() {
        var next = scriptQueue[0]
            , first
            , script;
        if (next && next.loaded) {
            executeRunning = true;
            scriptQueue.shift();
            first = document.getElementsByTagName("script")[0];
            script = document.createElement("script");
            script.onload = function () {
                if (next.callback) {
                    next.callback();
                }
                executeScriptQueue();
            };
            script.src = next.src;
            first.parentNode.insertBefore(script, first);
        } else {
            executeRunning = false;
        }
    }

    function setup() {
        jewel.showScreen("splash-screen");
    }

    function showScreen(screenId) {
        var dom = jewel.dom
            , $ = dom.$
            , activeScreen = $("#game .screen.active")[0]
            , screen = $("#" + screenId)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, "active");
        }
        dom.addClass(screen, "active");
    }

    return {
        load: load
        , setup: setup
        , showScreen : showScreen
    };
})();
