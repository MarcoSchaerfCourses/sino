let stats;

let scene;
let camera;
let renderer;

let onRenderFunctions = [];
let parameters = parseQuery(window.location.search);
const debug = parameters['debug'] === 'true';
let vehicleBBox;

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
        width: 1000,
        height: 1000,
        repeatX: 100,
        repeatY: 100,
    }));
    vehicle = new Vehicle(0.2, 0.001, 0.0005, 0.01, function (element) {
        element.add(camera);
        scene.add(element);
        if (debug) {
            vehicleBBox = new THREE.BoxHelper(element, 0xffff00);
            scene.add(vehicleBBox);
        }
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
        if (vehicleBBox != null) {
            vehicleBBox.update();
        }
    });

    if (settings.isSoundEnabled()) {
        sound.playBG();
    }

}

function update() {
    let vehicleBBox = vehicle.getBoundingBox();

    if (vehicleBBox == null) {
        return;
    }

    let hit = false;
    let collect = false;
    for (let i = 0; i < hays.length; i++) {
        let oBBox = getObjectBBox(hays[i]);
        if (oBBox.intersectsBox(vehicleBBox)) {
            console.log("It collected hay %s", i);
            scene.remove(hays[i]);
            hays.splice(i, 1);
            processor.onHayCollect();
            collect = true;
        }
    }
    for (let i = 0; i < obstacles.length; i++) {
        let oBBox = getObjectBBox(obstacles[i]);
        if (oBBox.intersectsBox(vehicleBBox)) {
            vehicle.metObstacle(oBBox);
            console.log("It intersects with obstacle %s", i);
            hit = true;
        }
    }

    if (settings.isSoundEnabled()) {
        if (hit) {
            sound.playHit();
        }

        if (collect) {
            sound.playCollect();
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
        if (debug) {
            let box = new THREE.BoxHelper(obst, 0xffff00);
            scene.add(box);
        }
    }

    welcomeText.hidden = true;
}

function initScene() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //document.body.appendChild(renderer.domElement);
    document.getElementById('holder').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.y = 15; // Up-down
    camera.position.z = -15;
    camera.rotateX(0.5);
    camera.rotateY(Math.PI);

    onRenderFunctions.push(function () {
        //camera.position.z = vehicle.position.z - 20; // Forward-backward
        //camera.position.x = vehicle.position.x; // Left-right
        //camera.lookAt(vehicle.position);
        renderer.render(scene, camera);
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
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

    if (debug) {
        stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom);
    }

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
        if (stats != null)
            stats.begin();
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
        if (stats != null)
            stats.end();
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
window.addEventListener("resize", onWindowResize, false);
