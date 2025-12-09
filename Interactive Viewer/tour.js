import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PLY_FILE = './Agisoft Metashape PCD2.0 (low quality sample for github).ply';
const CAMERAS_FILE = './Agisoft Metashape Cameras2.0.json';
const TRANSITION_DURATION = 1500;

let scene, camera, renderer, controls;
const worldGroup = new THREE.Group();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const cameraNodes = [];

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);


    scene.add(worldGroup);



    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 10, 20);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;


    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);


    const loader = new PLYLoader();
    loader.load(PLY_FILE, function (geometry) {

        geometry.computeBoundingSphere();
        const center = geometry.boundingSphere.center;
        const radius = geometry.boundingSphere.radius;


        geometry.translate(-center.x, -center.y, -center.z);



        if (geometry.attributes.color && !(geometry.attributes.color.array instanceof Float32Array)) {
            const old = geometry.attributes.color;
            geometry.setAttribute(
                'color',
                new THREE.Float32BufferAttribute(new Float32Array(old.array), 3)
            );
        }

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true
        });

        const points = new THREE.Points(geometry, material);
        worldGroup.add(points);


        camera.position.set(0, radius * 0.5, radius * 2.5);
        camera.near = 0.1;
        camera.far = radius * 100;
        camera.updateProjectionMatrix();
        controls.update();

    }, undefined, function (error) {
        console.error('An error occurred loading the PLY:', error);
    });


    loadCameras();


    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
}

function loadCameras() {
    fetch(CAMERAS_FILE)
        .then(response => response.json())
        .then(data => {
            const cameras = data.cameras;
            const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0x0088ff });

            cameras.forEach(camData => {
                const center = camData.center;

                const marker = new THREE.Mesh(sphereGeo, sphereMat);
                marker.position.set(center[0], center[1], center[2]);


                const R = camData.rotation;
                const m = new THREE.Matrix4();
                m.set(
                    R[0][0], R[0][1], R[0][2], 0,
                    R[1][0], R[1][1], R[1][2], 0,
                    R[2][0], R[2][1], R[2][2], 0,
                    0,       0,       0,       1
                );
                marker.setRotationFromMatrix(m);


                marker.userData = {
                    filename: camData.filename
                };

                worldGroup.add(marker);
                cameraNodes.push(marker);
            });
        })
        .catch(error => console.error('Error loading cameras:', error));
}

function onMouseClick(event) {
    const overlay = document.getElementById('photo-overlay');


    overlay.style.opacity = 0;
    overlay.src = "";


    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cameraNodes);

    if (intersects.length > 0) {
        moveToNode(intersects[0].object);
    }
}

function moveToNode(node) {
    const targetPos = new THREE.Vector3();
    node.getWorldPosition(targetPos);

    const targetQuat = new THREE.Quaternion();
    node.getWorldQuaternion(targetQuat);

    const currentPos = camera.position.clone();
    const currentQuat = camera.quaternion.clone();

    new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, TRANSITION_DURATION)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function (obj) {


            camera.position.lerpVectors(currentPos, targetPos, obj.t);


            camera.quaternion.slerpQuaternions(currentQuat, targetQuat, obj.t);


            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            controls.target.copy(camera.position).add(forward);
            controls.update();
        })
        .onComplete(function () {
            const overlay = document.getElementById('photo-overlay');
            overlay.src = node.userData.filename;
            overlay.style.opacity = 1;
        })
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}
