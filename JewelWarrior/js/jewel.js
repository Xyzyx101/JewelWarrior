var jewel = (function () {
    "use strict";
    var scriptQueue = []
        , numResources = 0
        , numResourcesLoaded = 0
        , executeRunning = false;

    var settings = {
        rows: 8
        , cols: 8
        , baseScore: 100
        , numJewelTypes: 7
        , controls: {
            // keyboard
            KEY_UP: "moveUp"
            , KEY_LEFT: "moveLeft"
            , KEY_DOWN: "moveDown"
            , KEY_RIGHT: "moveRight"
            , KEY_ENTER: "selectJewel"
            , KEY_SPACE: "selectJewel"

            // mouse and touch
            , CLICK: "selectJewel"
            , TOUCH: "selectJewel"

            // gamepad
            , BUTTON_A: "selectJewel"
            , LEFT_STICK_UP: "moveUp"
            , LEFT_STICK_DOWN: "moveDown"
            , LEFT_STICK_LEFT: "moveLeft"
            , LEFT_STICK_RIGHT: "moveRight"
        }
    };

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

    function preload(src) {
        var image = new Image();
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
        //hide the address bar on android
        if (/Android/.test(navigator.userAgent)) {
            $("html")[0].style.height = "200%";
            setTimeout(function () {
                window.scrollTo(0, 1);
            }, 0);
        }

        // disable touchmove to prevent overscroll
        jewel.dom.bind(document, "touchmove", function (event) {
            event.preventDefault();
        });

        if (isStandalone()) {
            showScreen("splash-screen");
        } else {
            showScreen("install-screen");
        }
    }

    function showScreen(screenId) {
        var dom = jewel.dom
            , $ = dom.$
            , activeScreen = $("#game .screen.active")[0]
            , screen = $("#" + screenId)[0];
        if (!jewel.screens[screenId]) {
            console.error("Module " + screenId + " not implimented.");
            return;
        }
        if (activeScreen) {
            dom.removeClass(activeScreen, "active");
        }
        dom.addClass(screen, "active");
        jewel.screens[screenId].run();
    }

    /* This will return true when installed on the homescreen of an iOS device.
     * It will be false on iOS in a browser.  
     * It will always be TRUE on non-iOS devices. */
    function isStandalone() {
        return (window.navigator.standalone !== false);
    }

    function hasWebWorkers() {
        return ("Worker" in window);
    }

    function getLoadProgress() {
        return numResourcesLoaded / numResources;
    }

    return {
        load: load
        , preload: preload
        , setup: setup
        , showScreen: showScreen
        , screens: {}
        , isStandalone: isStandalone
        , settings: settings
        , hasWebWorkers: hasWebWorkers
        , getLoadProgress: getLoadProgress
    };
})();
