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