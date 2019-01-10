let scene;
let camera;

let onRenderFunctions = [];
const debug = true;

let processor;
let vehicle;
let sound;
let settings;

// Parameters
let fieldSize = [100, 100];
let haySize = [1, 1, 2];

//Items
let hays = [];
let obstacles = [];

// UI
let scoreGameText;
let welcomeText;
let soundIcon;

function iterate(obj, root) {
    let i = 0;
    obj.traverse(function (child) {
        let id = root + "." + i;
        console.log(id + " " + child + " " + child.name);
        iterate(child, root);
        i++;
    });
}

function init() {

    settings = new Settings();
    processor = new Processor(5, fieldSize, haySize);
    sound = new Sound(function () {
        // Fallback to play
        settings.setSoundEnabled(false);
        updateSoundIcon();
    });
    initUI();
    initScene();
    addLight();
    scene.add(getSky(1000));
    scene.add(getGrassGround({
        width: fieldSize[0],
        height: fieldSize[1],
        repeatX: fieldSize[0],
        repeatY: fieldSize[1],
    }));
    vehicle = new Vehicle(0.2, 0.001, 0.0005, 0.01, function (element) {
        scene.add(element);
    });


    //////////////////////////////////////////////////////////////////////////////////
    //		Camera Controls							//
    //////////////////////////////////////////////////////////////////////////////////
    // var mouse = {x: 0, y: 0};
    // document.addEventListener('mousemove', function (event) {
    //     mouse.x = (event.clientX / window.innerWidth) * 2;
    //     mouse.y = (event.clientY / window.innerHeight) * 2;
    // }, false);
    // onRenderFunctions.push(function (delta, now) {
    //     camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3);
    //     camera.position.y += (mouse.y * 5 - camera.position.y + 1) * (delta * 3);
    //     camera.lookAt(scene.position)
    // });

    if (debug) {
        //The X axis is red. The Y axis is green. The Z axis is blue.
        scene.add(new THREE.AxisHelper(100));
    }

    initRendering();
    setupLevel();

    let keyHandler = new KeyPressListener();

    onRenderFunctions.push(function (delta, now) {
        vehicle.update(keyHandler.isUpPressed(), keyHandler.isRightPressed(), keyHandler.isDownPressed(), keyHandler.isLeftPressed());
        update();
    });

    if (settings.isSoundEnabled()) {
        sound.playBG();
    }

}

function update() {
    let vehicleBBox = vehicle.getBoundingBox();
    for (let i = 0; i < hays.length; i++) {
        let oBBox = getObjectBBox(hays[i]);
        if (oBBox.intersectsBox(vehicleBBox)) {
            console.log("It collected hay %s", i);
            scene.remove(hays[i]);
            hays.splice(i, 1);
            processor.onHayCollect();
        }
    }
    for (let i = 0; i < obstacles.length; i++) {
        let oBBox = getObjectBBox(obstacles[i]);
        if (oBBox.intersectsBox(vehicleBBox)) {
            vehicle.metObstacle(oBBox);
            console.log("It intersects with obstacle %s", i);
        }
    }

    if (hays.length > 0) {
        scoreGameText.innerHTML = 'Score ' + processor.getLevelScore();
    } else {
        scoreGameText.hidden = true;
        welcomeText.hidden = false;
        welcomeText.innerHTML = 'DONE!'
    }

}

function setupLevel() {
    //vehicle.reset();
    let level = processor.generateLevel();
    for (let i = 0; i < level.hays.length; i++) {
        let item = level.hays[i];
        let hay = getHay(item.size);
        shift(hay, item.position[0], item.position[1], item.position[2]);
        hay.rotateY(item.rotation);
        scene.add(hay);
        hays.push(hay);
    }

    for (let i = 0; i < level.obstacles.length; i++) {
        let item = level.obstacles[i];
        let obst = getObstacle(item.size);
        shift(obst, item.position[0], item.position[1], item.position[2]);
        obst.rotateY(item.rotation);
        scene.add(obst);
        obstacles.push(obst);
    }

    welcomeText.hidden = true;
}

function initScene() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //document.body.appendChild(renderer.domElement);
    document.getElementById('holder').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 10; // Forward-backward
    camera.position.x = 13; // Left-right
    camera.position.y = 15; // Up-down

    onRenderFunctions.push(function () {
        camera.lookAt(vehicle.position);
        renderer.render(scene, camera);
    })
}

function initUI() {
    scoreGameText = document.getElementById('scoreGame');
    welcomeText = document.getElementById('welcomeText');

    soundIcon = document.getElementById('soundToggle');
    soundIcon.addEventListener("click", function () {
        settings.setSoundEnabled(!settings.isSoundEnabled());
        updateSoundIcon();
        if (settings.isSoundEnabled()) {
            sound.playBG();
        } else {
            sound.stop();
        }
    });
    updateSoundIcon();
}

function updateSoundIcon() {
    if (settings.isSoundEnabled()) {
        soundIcon.src = 'images/speaker.png';
    } else {
        soundIcon.src = 'images/mute.png';
    }
}

function addLight() {
    //		set 3 point lighting
    // add a ambient light
    var light = new THREE.AmbientLight(0x020202);
    scene.add(light);
    // add a light in front
    light = new THREE.DirectionalLight('white', 1);
    light.position.set(0.5, 0.5, 2);
    scene.add(light);
    // add a light behind
    light = new THREE.DirectionalLight('white', 0.75);
    light.position.set(-0.5, 2.5, -2);
    scene.add(light);
}

function initRendering() {
    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        // call each update function
        onRenderFunctions.forEach(function (funct) {
            funct(deltaMsec / 1000, nowMsec / 1000);
        });
    });
}

function reset() {

    for (let i = 0; i < hays.length; i++) {
        scene.remove(hays[i]);
    }
    hays.clear();

    for (let i = 0; i < obstacles.length; i++) {
        scene.remove(obstacles[i]);
    }
    obstacles.clear();

    vehicle.position.set(0, 0, 0);

}

window.addEventListener("load", init);
