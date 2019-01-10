class Processor {

    constructor(level, fieldSize, haySize) {
        this.level = level;
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

    /**
     *
     * @param timeGone
     */
    update(timeGone) {

    }

    reset() {

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
        this.length = 2.0;

        let scope = this;
        getTractor(function (object1) {
            scope.body = object1;
            elementsCallback(object1)
        });

    }

    Vehicle.prototype = {
        constructor: Vehicle,
        metObstacle: function () {

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
            let thettaSpeed = 0.5 * this.length * Math.tan(this.angle) * this.speed;
            this.body.rotateY(thettaSpeed);

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
        isIntersects: function (object) {

        },
        reset: function () {
            this.position = new THREE.Vector3();
        },

    };
    return Vehicle;
})();
