let scene;
let camera;

let onRenderFunctions = [];
const debug = true;

function init() {
    initScene();
    addLight();
    scene.add(getSky(1000));
    scene.add(getGrassGround({width: 100, height: 100, repeatX: 100, repeatY: 100,}));


    //////////////////////////////////////////////////////////////////////////////////
    //		Camera Controls							//
    //////////////////////////////////////////////////////////////////////////////////
    var mouse = {x: 0, y: 0};
    document.addEventListener('mousemove', function (event) {
        mouse.x = (event.clientX / window.innerWidth) - 0.5;
        mouse.y = (event.clientY / window.innerHeight) - 0.5
    }, false);
    onRenderFunctions.push(function (delta, now) {
        camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3);
        camera.position.y += (mouse.y * 5 - camera.position.y + 1) * (delta * 3);
        camera.lookAt(scene.position)
    });

    if (debug)
        scene.add(new THREE.AxisHelper(100));

    initRendering();
}

function initScene() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 3;

    onRenderFunctions.push(function () {
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

window.addEventListener("load", init);