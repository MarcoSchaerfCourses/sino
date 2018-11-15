Physijs.scripts.worker = 'lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

let renderer;
let sceneWidth;
let sceneHeight;
let dom;
let car = {};
const friction = 0.9;//high
let redraw = true;
let wheel_material, wheel_geometry, big_wheel_geometry;
const damping = 0.7;

function init() {
    createScene();
    render();
}

function createScene() {

    sceneWidth = window.innerWidth - 50;
    sceneHeight = window.innerHeight - 50;
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);//perspective camera
    renderer = new THREE.WebGLRenderer({alpha: true});//renderer with transparent backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);
    dom = document.getElementById('RenderingContainer');
    dom.appendChild(renderer.domElement);

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -30, 0));
    scene.addEventListener('update', physicsUpdate);

    camera.position.set(-120, 60, 0);
    camera.lookAt(scene.position);
    scene.add(camera);

    addField();
    addTractor();

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
    let size = 1000;
    insertField(size);
    insertWarehouse(size / 2, size / 2);
}

function insertField(size) {

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
    ground = new Physijs.BoxMesh(new THREE.CylinderGeometry(size, size, 1, 32), ground_material,// mass
    );
    ground.receiveShadow = true;
    scene.add(ground);
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

function addTractor() {
    var car_material = Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: 0xff6666,
        shading: THREE.FlatShading
    }), friction, .9);
    wheel_material = Physijs.createMaterial(new THREE.MeshStandardMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading
        }), friction, .6 // medium restitution
    );
    wheel_geometry = new THREE.CylinderGeometry(2, 2, 1, 10);

    car.body = new Physijs.BoxMesh(new THREE.BoxGeometry(10, 2, 7), car_material, 700);
    car.body.position.y = 8;
    car.body.castShadow = true;
    car.body.name = "cart";
    scene.add(car.body);

    car.wheel_fm_constraint = addWheel(car.wheel_fm, new THREE.Vector3(-7.5, 6.5, 0), false, 300);
    car.wheel_fm_constraint.setAngularLowerLimit({x: 0, y: -Math.PI / 8, z: 1});
    car.wheel_fm_constraint.setAngularUpperLimit({x: 0, y: Math.PI / 8, z: 0});
    car.wheel_bl_constraint = addWheel(car.wheel_bl, new THREE.Vector3(3.5, 6.5, 5), false, 500);
    car.wheel_br_constraint = addWheel(car.wheel_br, new THREE.Vector3(3.5, 6.5, -5), false, 500);

    car.carriage = new Physijs.BoxMesh(new THREE.BoxGeometry(16, 7, 5), car_material, 200);
    car.carriage.position.y = 13;
    car.carriage.position.x = 12;
    car.carriage.castShadow = true;
    car.carriage.name = "cart";
    scene.add(car.carriage);

    car.carriage_constraint = new Physijs.HingeConstraint(
        car.carriage, // First object to be constrained
        car.body, // constrained to this
        new THREE.Vector3(6, 0, 0), // at this point
        new THREE.Vector3(0, 1, 0) // along this axis
    );
    scene.addConstraint(car.carriage_constraint);
    car.carriage_constraint.setLimits(
        -Math.PI / 3, // minimum angle of motion, in radians
        Math.PI / 3, // maximum angle of motion, in radians
        0, // applied as a factor to constraint error
        0 // controls bounce at limit (0.0 == no bounce)
    );
    /*//this will also work
    car.carriage_constraint = new Physijs.DOFConstraint(	car.carriage, car.body, new THREE.Vector3( 6, 6.5, 0 ));
    scene.addConstraint( car.carriage_constraint );
    car.carriage_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 3, z: -Math.PI / 3 });
    car.carriage_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 3, z: Math.PI / 3 });
    */
    big_wheel_geometry = new THREE.CylinderGeometry(4, 4, 1, 10);

    car.carriage_wheel_bl_constraint = addWheel(car.carriage_wheel_bl, new THREE.Vector3(15, 8.3, 4), true, 100);
    car.carriage_wheel_bl_constraint.setAngularLowerLimit({x: 0, y: 0, z: 1});
    car.carriage_wheel_bl_constraint.setAngularUpperLimit({x: 0, y: 0, z: 0});
    car.carriage_wheel_br_constraint = addWheel(car.carriage_wheel_br, new THREE.Vector3(15, 8.3, -4), true, 100);
    car.carriage_wheel_br_constraint.setAngularLowerLimit({x: 0, y: 0, z: 1});
    car.carriage_wheel_br_constraint.setAngularUpperLimit({x: 0, y: 0, z: 0});
}

function addWheel(wheel, pos, isBig, weight) {
    var geometry = wheel_geometry;
    if (isBig) {
        geometry = big_wheel_geometry;
    }
    wheel = new Physijs.CylinderMesh(
        geometry,
        wheel_material,
        weight
    );
    wheel.name = "cart";
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;
    scene.add(wheel);
    wheel.setDamping(0, damping);
    var wheelConstraint = new Physijs.DOFConstraint(
        wheel, car.body, pos
    );
    if (isBig) {
        wheelConstraint = new Physijs.DOFConstraint(
            wheel, car.carriage, pos);
    }
    scene.addConstraint(wheelConstraint);
    wheelConstraint.setAngularLowerLimit({x: 0, y: 0, z: 0});
    wheelConstraint.setAngularUpperLimit({x: 0, y: 0, z: 0});
    return wheelConstraint;
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

//window.addEventListener("load", init);