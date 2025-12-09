import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURATION ---
const PLY_FILE = './Agisoft Metashape PCD (low quality sample for github).ply';
const CAMERAS_FILE = './Agisoft Metashape Cameras.json';
// ---------------------

let scene, camera, renderer, controls;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const cameraNodes = []; // clickable spheres

// --- Animation state for lerp/slerp ---
let isAnimating = false;
let animStartTime = 0;
const animDuration = 1000; // ms

const camStartPos = new THREE.Vector3();
const camEndPos   = new THREE.Vector3();

const camStartQuat = new THREE.Quaternion();
const camEndQuat   = new THREE.Quaternion();

const targetStart = new THREE.Vector3();
const targetEnd   = new THREE.Vector3();

// ------------------------------------------------------------
// Init & main loop
// ------------------------------------------------------------
init();
animate();

// ------------------------------------------------------------
// Setup
// ------------------------------------------------------------
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    camera.position.set(0, 2, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Load assets
    loadPointCloud();
    loadCameras();

    // Events
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
}

// ------------------------------------------------------------
// Load point cloud
// ------------------------------------------------------------
function loadPointCloud() {
    const loader = new PLYLoader();
    console.log('Loading point cloud:', PLY_FILE);

    loader.load(
        PLY_FILE,
        geometry => {
            console.log('Point cloud loaded.');

            geometry.computeVertexNormals();
            geometry.computeBoundingSphere();

            const material = new THREE.PointsMaterial({
                size: 0.01,
                vertexColors: true
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // Center view on the cloud
            if (geometry.boundingSphere) {
                const center = geometry.boundingSphere.center;
                const radius = geometry.boundingSphere.radius || 1.0;

                controls.target.copy(center);
                camera.position.copy(
                    center.clone().add(new THREE.Vector3(0, radius * 1.5, radius * 2.0))
                );
                controls.update();
            }
        },
        xhr => {
            if (xhr.total) {
                const pct = (xhr.loaded / xhr.total) * 100;
                console.log(`PLY ${pct.toFixed(1)}% loaded`);
            }
        },
        error => {
            console.error('Error loading PLY:', error);
        }
    );
}

// ------------------------------------------------------------
// Load cameras as clickable spheres
// ------------------------------------------------------------
function loadCameras() {
    console.log('Loading cameras JSON:', CAMERAS_FILE);

    fetch(CAMERAS_FILE)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const cams = data.cameras || [];
            console.log(`Loaded ${cams.length} camera entries.`);

            const sphereGeo = new THREE.SphereGeometry(0.05, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0x3399ff });

            cams.forEach((cam, idx) => {
                const label = cam.label || `cam_${idx}`;
                const center = cam.center || [0, 0, 0];
                const rotation = cam.rotation || null;

                const node = new THREE.Mesh(sphereGeo, sphereMat);
                node.position.set(center[0], center[1], center[2]);
                node.userData.label = label;
                node.userData.rotation = rotation;      // 3x3 array
                node.userData.translation = cam.translation || [0, 0, 0];

                cameraNodes.push(node);
                scene.add(node);
            });
        })
        .catch(err => {
            console.error('Error loading cameras JSON:', err);
        });
}

// ------------------------------------------------------------
// Mouse interaction
// ------------------------------------------------------------
function onMouseClick(event) {
    // Normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cameraNodes, false);
    if (intersects.length > 0) {
        const node = intersects[0].object;
        console.log('Clicked camera node:', node.userData.label);
        moveToNode(node);
    }
}

// ------------------------------------------------------------
// Smooth camera move (lerp/slerp)
// ------------------------------------------------------------
function moveToNode(node) {
    const targetPos = node.position;

    // Build target rotation quaternion from 3x3 rotation matrix in JSON
    const R = node.userData.rotation;
    let targetQuat = new THREE.Quaternion();

    if (R && R.length === 3 && R[0].length === 3) {
        const m = new THREE.Matrix4();
        m.set(
            R[0][0], R[0][1], R[0][2], 0,
            R[1][0], R[1][1], R[1][2], 0,
            R[2][0], R[2][1], R[2][2], 0,
            0,       0,       0,       1
        );
        targetQuat.setFromRotationMatrix(m);
    } else {
        // Fallback: keep current orientation if no rotation in JSON
        targetQuat.copy(camera.quaternion);
    }

    // Where we want the controls to look (slightly ahead of the node)
    const lookAhead = new THREE.Vector3(
        targetPos.x,
        targetPos.y,
        targetPos.z - 1
    );

    // Capture current state
    camStartPos.copy(camera.position);
    camStartQuat.copy(camera.quaternion);
    targetStart.copy(controls.target);

    // Target state
    camEndPos.copy(targetPos);
    camEndQuat.copy(targetQuat);
    targetEnd.copy(lookAhead);

    // Start animation
    animStartTime = performance.now();
    isAnimating = true;
}

// ------------------------------------------------------------
// Resize
// ------------------------------------------------------------
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ------------------------------------------------------------
// Main render loop
// ------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        const now = performance.now();
        let t = (now - animStartTime) / animDuration;

        if (t >= 1.0) {
            t = 1.0;
            isAnimating = false;
        }

        // Optional ease-in-out (comment out if you want pure linear)
        t = t * t * (3 - 2 * t);

        // Lerp position
        camera.position.lerpVectors(camStartPos, camEndPos, t);

        // Slerp rotation
        camera.quaternion.slerpQuaternions(camStartQuat, camEndQuat, t);

        // Lerp controls target
        controls.target.lerpVectors(targetStart, targetEnd, t);
        controls.update();
    } else {
        controls.update();
    }

    renderer.render(scene, camera);
}
