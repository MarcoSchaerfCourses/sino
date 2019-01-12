const texturesBaseUrl = './images/';
const modelsBaseUrl = "./models/";
const texturesLoader = new THREE.TextureLoader();
THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

function getGrassGround(opts) {
    // handle default arguments
    opts = opts || {};
    var width = opts.width !== undefined ? opts.width : 1;
    var height = opts.height !== undefined ? opts.height : 1;
    var segmentsW = opts.segmentsW !== undefined ? opts.segmentsW : 1;
    var segmentsH = opts.segmentsH !== undefined ? opts.segmentsH : 1;
    var repeatX = opts.repeatX !== undefined ? opts.repeatX : 1;
    var repeatY = opts.repeatY !== undefined ? opts.repeatY : 1;
    var anisotropy = opts.anisotropy !== undefined ? opts.anisotropy : 16;

    // create the textureDiffuse
    var textureDiffuseUrl = texturesBaseUrl + 'grasslight-small.jpg';
    var textureDiffuse = texturesLoader.load(textureDiffuseUrl);
    textureDiffuse.wrapS = THREE.RepeatWrapping;
    textureDiffuse.wrapT = THREE.RepeatWrapping;
    textureDiffuse.repeat.x = repeatX;
    textureDiffuse.repeat.y = repeatY;
    textureDiffuse.anisotropy = anisotropy;

    // create the textureNormal
    var textureNormalUrl = texturesBaseUrl + 'grasslight-small-nm.jpg';
    var textureNormal = texturesLoader.load(textureNormalUrl);
    textureNormal.wrapS = THREE.RepeatWrapping;
    textureNormal.wrapT = THREE.RepeatWrapping;
    textureNormal.repeat.x = repeatX;
    textureNormal.repeat.y = repeatY;
    textureNormal.anisotropy = anisotropy;

    // build object3d
    var geometry = new THREE.PlaneGeometry(width, height, segmentsW, segmentsH);
    var material = new THREE.MeshPhongMaterial({
        map: textureDiffuse,
        normalMap: textureNormal,
        normalScale: new THREE.Vector2(1, 1).multiplyScalar(0.5),
        color: 0x44FF44,
    });
    var object3D = new THREE.Mesh(geometry, material);
    object3D.rotateX(-Math.PI / 2);
    // return the just-built object3d
    return object3D;
}

function getSky(size) {
    var skyGeo = new THREE.SphereGeometry(size, 25, 25);
    var url = texturesBaseUrl + "sky.jpg";
    var texture = texturesLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = size;
    texture.repeat.y = size;
    texture.anisotropy = 16;
    var material = new THREE.MeshPhongMaterial({
        map: texture,
    });
    var sky = new THREE.Mesh(skyGeo, material);
    sky.material.side = THREE.BackSide;
    return sky;
}

let hayMaterial = null;
let hayGeometry = null;

function getHay(size) {
    if (hayMaterial == null) {
        var texture = texturesLoader.load(texturesBaseUrl + 'hay.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 2;
        texture.repeat.y = 2;
        texture.anisotropy = 16;
        hayMaterial = new THREE.MeshBasicMaterial({map: texture});
    }

    if (hayGeometry == null) {
        hayGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    }

    const cube = new THREE.Mesh(hayGeometry, hayMaterial);
    cube.position.set(0, size[1] / 2, 0);
    return cube;
}

let obstMaterial = null;

function getObstacle(size) {
    if (obstMaterial == null) {
        var texture = texturesLoader.load(texturesBaseUrl + 'rock.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 2;
        texture.repeat.y = 2;
        texture.anisotropy = 16;
        obstMaterial = new THREE.MeshBasicMaterial({map: texture});
    }

    let obstGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);

    const cube = new THREE.Mesh(obstGeometry, obstMaterial);
    cube.position.set(0, size[1] / 2, 0);
    return cube;
}

function getTractor(callback) {
    //getTractorModel(callback);
    getTractorCustom(callback);
}

function getTractorCustom(callback) {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(modelsBaseUrl + "tractor1/");
    mtlLoader.load("tractor.mtl", function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);

        let vehicle = new THREE.Group();

        objLoader.load(modelsBaseUrl + "tractor1/tractor_body.obj", function (body) {
            // Add body
            vehicle.add(body);
            objLoader.load(modelsBaseUrl + "tractor1/tractor_front_wheel.obj", function (wheel_left) {
                // Add front left wheel
                wheel_left.name = 'front_wheel';
                let wheel_right = wheel_left.clone();

                let size = getObjectBBox(wheel_left).getSize(new THREE.Vector3());
                let z_shift = 2.9;
                let x_shift = 2;
                shift(wheel_left, x_shift, size.y / 2, z_shift);

                wheel_right.rotateY(Math.PI);
                shift(wheel_right, -x_shift, size.y / 2, z_shift);

                vehicle.add(wheel_left);
                vehicle.add(wheel_right);
                objLoader.load(modelsBaseUrl + "tractor1/tractor_rear_wheels.obj", function (wheel) {
                    // Add front right wheel
                    wheel.name = 'rear_wheels';
                    let size = getObjectBBox(wheel).getSize(new THREE.Vector3());
                    shift(wheel, 0, size.y / 2, -2);
                    vehicle.add(wheel);
                    callback(vehicle);
                });

            });
        });
    });
}

function getTractorModel(callback) {
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(modelsBaseUrl + "tractor1/");
    mtlLoader.load("tractor.mtl", function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(modelsBaseUrl + "tractor1/tractor.obj", callback);
    });
}

function getWarehouse(callback, scale = 0.02) {
    var loader = new THREE.OBJLoader();
    loader.load(modelsBaseUrl + "warehouse/warehouse.obj", function (object) {
        object.scale.x = scale;
        object.scale.y = scale;
        object.scale.z = scale;
        callback(object)
    })
}
