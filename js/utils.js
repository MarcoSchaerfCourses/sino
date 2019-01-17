function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

KeyPressListener = (function () {
    var leftKey = 'ArrowLeft', upKey = 'ArrowUp', rightKey = 'ArrowRight', downKey = 'ArrowDown';
    var keystate = {};
    document.addEventListener("keydown", function (e) {
        keystate[e.key] = true;
        //console.log(e.key);
    });
    document.addEventListener("keyup", function (e) {
        delete keystate[e.key];
        //console.log("Release " + e.key);
    });

    function isKeyPressed(key) {
        return keystate[key];
    }

    function KeyPressListener() {

    }

    KeyPressListener.prototype = {

        constructor: KeyPressListener,

        isUpPressed: function () {
            return isKeyPressed(upKey);
        },

        isDownPressed: function () {
            return isKeyPressed(downKey);
        },

        isLeftPressed: function () {
            return isKeyPressed(leftKey);
        },

        isRightPressed: function () {
            return isKeyPressed(rightKey);
        }
    };

    return KeyPressListener
})();

function shift(object, x = 0, y = 0, z = 0) {
    object.position.x += x;
    object.position.y += y;
    object.position.z += z;
}

function getObjectBBox(object) {
    return new THREE.Box3().setFromObject(object);
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

function getNowSeconds() {
    return Math.floor(Date.now() / 1000);
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}
