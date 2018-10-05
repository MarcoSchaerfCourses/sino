Physijs.scripts.worker = 'lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

let camera;
let renderer;
let scene;
let sceneWidth;
let sceneHeight;
let dom;
let friction = 0.9;//high
let redraw = true;

function init() {
    createScene();
    render();
}

function createScene() {

    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(30, sceneWidth / sceneHeight, 0.1, 1000);//perspective camera
    renderer = new THREE.WebGLRenderer({alpha: true});//renderer with transparent backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);
    dom = document.getElementById('RenderingContainer');
    dom.appendChild(renderer.domElement);

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -30, 0));
    scene.addEventListener('update', physicsUpdate);

    camera.position.set(-120, 50, -120);
    camera.lookAt(scene.position);
    scene.add(camera);

    addField();
    addTraktor();

    scene.simulate();

    // window.addEventListener('resize', onWindowResize, false);//resize callback
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

}

function handleKeyDown(keyEvent) {
    switch (keyEvent.keyCode) {
        case 37:
            redraw = true;
            break;

    }
}

function handleKeyUp(keyEvent) {
    switch (keyEvent.keyCode) {
        case 37:
            redraw = true;
            break;

    }
}

function addField() {
    let size = 100;
    insertField(size);
    insertWarehouse(size / 2, size / 2);
}

function insertField(size = 150) {

    let ground_material, ground_geometry, sun, ground;
    sun = new THREE.DirectionalLight(0xFFFFFF);
    sun.position.set(20, 50, -15);
    sun.castShadow = true;
    sun.shadowCameraLeft = -120;
    sun.shadowCameraTop = -120;
    sun.shadowCameraRight = 100;
    sun.shadowCameraBottom = 100;
    sun.shadowCameraNear = 1;
    sun.shadowCameraFar = 300;
    sun.shadowMapWidth = sun.shadowMapHeight = 512;
    scene.add(sun);
    //var helper = new THREE.CameraHelper( sun.shadow.camera );
    //scene.add( helper );// enable to see the light cone

    ground_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial({color: 0xf4d142}), friction, .9 // low restitution
    );
    // Ground
    ground = new Physijs.BoxMesh(new THREE.BoxGeometry(size, 1, size), ground_material, 0 // mass
    );
    ground.receiveShadow = true;
    scene.add(ground);
    //walls
    let wall_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial({color: 0x444444}), friction, .9 // low restitution
    );
    let wallHeight = 3;
    let wallLength = size;
    let wall1 = new Physijs.BoxMesh(new THREE.BoxGeometry(wallLength, wallHeight, 2), wall_material, 0 // mass
    );
    //wall1.castShadow = true;
    wall1.position.y = wallHeight / 2;
    wall1.position.z = wallLength / 2;
    scene.add(wall1);
    let wall2 = new Physijs.BoxMesh(new THREE.BoxGeometry(wallLength, wallHeight, 2), wall_material, 0 // mass
    );
    //wall2.castShadow = true;
    wall2.position.y = wallHeight / 2;
    wall2.position.z = -wallLength / 2;
    scene.add(wall2);
    let wall3 = new Physijs.BoxMesh(new THREE.BoxGeometry(2, wallHeight, wallLength), wall_material, 0 // mass
    );
    //wall3.castShadow = true;
    wall3.position.y = wallHeight / 2;
    wall3.position.x = -wallLength / 2;
    scene.add(wall3);
    let wall4 = new Physijs.BoxMesh(new THREE.BoxGeometry(2, wallHeight, wallLength), wall_material, 0 // mass
    );
    //wall4.castShadow = true;
    wall4.position.y = wallHeight / 2;
    wall4.position.x = wallLength / 2;
    scene.add(wall4);
}

function insertWarehouse(x, y) {

    let width = 15;
    let height = 20;
    let length = 20;

    let material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial({color: 0xf44242}), friction, .9 // low restitution
    );

    let warehouse = new Physijs.BoxMesh(new THREE.BoxGeometry(width, height, length), material, 0 // mass
    );

    warehouse.position.x = x + (height / 2) * (x > 0 ? -1 : 1);
    warehouse.position.z = y + (length / 2) * (y > 0 ? -1 : 1);
    scene.add(warehouse);

    //let roof = new Physijs.Mesh

}

function insertHaystack(x, y) {

}

function addTraktor() {

}

function physicsUpdate() {
    scene.simulate(undefined, 2);
}

function render() {
    requestAnimationFrame(render);
    if (redraw) {
        renderer.render(scene, camera);
        redraw = false;
    }

}

window.addEventListener("load", init);