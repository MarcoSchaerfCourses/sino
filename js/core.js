class Processor {

    constructor(level, fieldSize, haySize) {
        this.level = level;
        this.score = 0;
        this._fieldSize = fieldSize;
        this._haySize = haySize;
    }

    generateLevel() {
        let levelParameters = new Level();
        let haysCount = 20;
        let obstaclesCount = Math.max(0, this.level - 1);
        let hays = [];
        for (let i = 0; i < haysCount; i++) {
            let item = new Item();
            item.size = this._haySize;
            item.position = [getRandomInt(this._fieldSize[0]) - this._fieldSize[0] / 2, 0,
                getRandomInt(this._fieldSize[1]) - this._fieldSize[1] / 2];
            item.rotation = Math.random() * Math.PI;
            hays.push(item);
        }
        let obstacles = [];
        for (let i = 0; i < obstaclesCount; i++) {
            let item = new Item();
            item.size = [getRandomInt(10) + 1, getRandomInt(2) + 1, getRandomInt(2) + 1];
            item.position = [getRandomInt(this._fieldSize[0]) - this._fieldSize[0] / 2, 0,
                getRandomInt(this._fieldSize[1]) - this._fieldSize[1] / 2];
            item.rotation = Math.random() * Math.PI;
            obstacles.push(item);
        }
        levelParameters.hays = hays;
        levelParameters.obstacles = obstacles;
        return levelParameters;
    }

    onHayCollect() {
        this.score += 1;
    }

    getLevelScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
    }

}

class Level {
    constructor(hays, obstacles) {
        this.hays = hays;
        this.obstacles = obstacles;

    }
}

class Item {

    constructor(size, position, rotation) {
        this.size = size;
        this.position = position;
        this.rotation = rotation;

    }
}

Vehicle = (function () {

    function Vehicle(maxSpeed, maxAcceleration, friction, maxSteeringSpeed, elementsCallback) {
        this.maxSpeed = maxSpeed;
        this.maxAcceleration = maxAcceleration;
        this.friction = friction;
        this.speed = 0;

        // Wheels
        this.angle = 0;
        this.maxSteerSpeed = maxSteeringSpeed;
        this.maxSteerAngle = Math.PI / 3; // 60 deg

        this.body = null;
        this.position = new THREE.Vector3();
        this.size = null;

        let scope = this;
        getTractor(function (object1) {
            scope.body = object1;
            scope.size = scope.getBoundingBox().getSize(new THREE.Vector3());
            elementsCallback(object1)
        });

    }

    Vehicle.prototype = {
        constructor: Vehicle,
        /**
         *
         * @param boundingBox type THREE.Box
         */
        metObstacle: function (boundingBox) {
            this.speed = -this.speed / 2;
        },
        update: function (forr, right, backw, left) {

            if (this.body == null) {
                return;
            }

            // Speed
            if (forr || backw) {
                let accel = this.maxAcceleration;
                if (forr) {
                    accel = -accel;
                }
                this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed + accel));
            } else {
                if (this.speed > 0) {
                    this.speed = Math.max(0, this.speed - this.friction);
                } else {
                    this.speed = Math.min(0, this.speed + this.friction);
                }
            }

            // Angle
            if (left || right) {
                let steeringAngle = this.maxSteerSpeed;
                if (left) {
                    steeringAngle = -steeringAngle;
                }
                this.angle = Math.max(-this.maxSteerAngle, Math.min(this.maxSteerAngle, this.angle + steeringAngle));
            } else {
                if (this.angle > 0) {
                    this.angle = Math.max(0, this.angle - this.maxSteerSpeed);
                } else {
                    this.angle = Math.min(0, this.angle + this.maxSteerSpeed);
                }
            }
            // Calculating velocities. Using kinematic model of bicycle
            let thettaSpeed = 0.5 * this.size.z * Math.tan(this.angle) * this.speed;
            this.body.rotateY(thettaSpeed / 10);

            let v = new THREE.Vector3(1, 0, 0);
            v.applyEuler(this.body.rotation);
            v.projectOnPlane(new THREE.Vector3(0, 1, 0));

            //console.log("%s %s %s %s", v.x, v.y, v.z, Math.atan2(v.z , v.x));
            let thetta = Math.atan2(v.x, v.z);
            thetta = -thetta;
            if (thetta < 0) thetta += Math.PI * 2;
            let xSpeed = Math.cos(thetta) * this.speed;
            let ySpeed = Math.sin(thetta) * this.speed;

            //console.log("Wheel angle %s, Thetta speed %s, thetta %s, xSpeed %s, ySpeed %s",
            //     this.angle.toFixed(3), thettaSpeed.toFixed(3), thetta.toFixed(3), xSpeed.toFixed(3), ySpeed.toFixed(3));

            shift(this.body, xSpeed, 0, ySpeed);
            this.position = this.body.position;
        },
        getBoundingBox: function () {
            if (this.body == null) {
                return null;
            } else {
                return getObjectBBox(this.body);
            }
        },
        reset: function () {
            this.position = new THREE.Vector3();
            this.angle = 0;
            this.speed = 0;
        },

    };
    return Vehicle;
})();

Sound = (function () {

    function Sound(callback) {

        this.callback = callback;

        // BG
        this.bg = new Audio('sound/Spy Hunter.mp3');
        this.bg.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
        this.bg.volume = 0.5;

        // Collect
        this.collect = new Audio('sound/fall.mp3');

        // Hit
        this.hit = new Audio('sound/hit.mp3');
    }

    Sound.prototype = {
        constructor: Sound,
        playBG: function () {
            this._managePromise(this.bg.play())
        },
        playHit() {
            this.hit.currentTime = 0;
            this._managePromise(this.hit.play());
        },
        playCollect() {
            this.collect.currentTime = 0;
            this._managePromise(this.collect.play());
        },
        _managePromise(promise) {
            if (promise !== undefined) {
                promise.then(_ => {
                    // Autoplay started!
                }).catch(error => {
                    // Autoplay was prevented.
                    // Show a "Play" button so that user can start playback.
                    this.callback();
                });
            }
        },
        stop(bool) {
            this.bg.pause();
        },
    };
    return Sound;
})();

Settings = (function () {

    function Settings() {
        this.storage = window.localStorage;
    }

    Settings.prototype = {
        constructor: Settings,
        isSoundEnabled() {
            return this.storage.getItem('sound') === 'true';
        },
        setSoundEnabled(enabled) {
            this.storage.setItem('sound', enabled);
        }
    };
    return Settings;
})();
