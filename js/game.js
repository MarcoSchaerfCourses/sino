let scene;
let camera;

let onRenderFunctions = [];
const debug = true;

let tractor;
let warehouse;
let processor;

// Parameters
let fieldSize = [100, 100];
let haySize = [1, 1, 2];

//Items
let hays = [];
let obstacles = [];

function iterate(obj, root) {
    let i = 0;
    obj.traverse(function (child) {
        let id = root + "." + i;
        console.log(id + " " + child + " " + child.name);
        iterate(child, root);
        i++;
    });
}

function shift(object, x = 0, y = 0, z = 0) {
    object.position.x += x;
    object.position.y += y;
    object.position.z += z;
}

function init() {
    processor = new Processor(5, fieldSize, haySize);
    initScene();
    addLight();
    scene.add(getSky(1000));
    scene.add(getGrassGround({
        width: fieldSize[0],
        height: fieldSize[1],
        repeatX: fieldSize[0],
        repeatY: fieldSize[1],
    }));
    getTractor(function (object) {
        tractor = object;
        if (tractor != null) {
            scene.add(object);
        }

        //iterate(object, "_")
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

    if (debug)
        scene.add(new THREE.AxisHelper(100));

    initRendering();
    setupLevel();
}

function setupLevel() {
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
}

function initScene() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 10; // Forward-backward
    camera.position.x = 13; // Left-right
    camera.position.y = 150; // Up-down

    onRenderFunctions.push(function () {
        if (tractor != null) {
            camera.lookAt(tractor.position);
        }
        renderer.render(scene, camera);
    })
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

    tractor.position.set(0, 0, 0);

}

window.addEventListener("load", init);