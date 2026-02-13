import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// 1. Scene & Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. CSS2D Label Renderer Setup
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1000, 2000);
controls.update();

const textureLoader = new THREE.TextureLoader();

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 150000, 15000);
scene.add(sunLight);

// 4. Planet Data (Inclination, Axial Tilt, Colors)
const planetsData = [
    { name: "mercury", radius: 7, distance: 180, speed: 0.04, inclination: 7.0, tilt: 0.03, color: 0x999999, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mercury.jpg' },
    { name: "venus", radius: 13, distance: 260, speed: 0.015, inclination: 3.4, tilt: 177.3, color: 0xffd393, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus_surface.jpg' },
    { name: "earth", radius: 14, distance: 350, speed: 0.01, inclination: 0.0, tilt: 23.5, color: 0x2277ff, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg' },
    { name: "mars", radius: 9, distance: 450, speed: 0.008, inclination: 1.85, tilt: 25.2, color: 0xff4000, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars.jpg' },
    { name: "jupiter", radius: 55, distance: 700, speed: 0.002, inclination: 1.3, tilt: 3.1, color: 0xe3a869, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg' },
    { name: "saturn", radius: 46, distance: 950, speed: 0.0009, inclination: 2.5, tilt: 26.7, color: 0xf5e1a4, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn.jpg', hasRing: true },
    { name: "uranus", radius: 26, distance: 1150, speed: 0.0004, inclination: 0.77, tilt: 97.8, color: 0xb4e8f0, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/uranus.jpg' },
    { name: "neptune", radius: 25, distance: 1350, speed: 0.0001, inclination: 1.77, tilt: 28.3, color: 0x3d5eff, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/neptune.jpg' }
];

const meshes = {};
const orbitGroups = {};

// 5. Sun Setup
const sunGeometry = new THREE.SphereGeometry(140, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xff3300, emissiveIntensity: 2, color: 0xffaa00
});
textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg', (tex) => {
    sunMaterial.map = tex; sunMaterial.emissiveMap = tex; sunMaterial.needsUpdate = true;
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);
meshes["sun"] = sunMesh;

// 6. Creating Planets with Labels
planetsData.forEach(data => {
    // 공전 궤도 그룹 (Inclination 반영)
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.z = THREE.MathUtils.degToRad(data.inclination);
    scene.add(orbitGroup);
    orbitGroups[data.name] = orbitGroup;

    // 자전축 기울기 그룹 (Axial Tilt 반영)
    const tiltGroup = new THREE.Group();
    tiltGroup.position.x = data.distance;
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.tilt);
    orbitGroup.add(tiltGroup);

    // 행성 메쉬
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.7 });
    textureLoader.load(data.texture, (tex) => { material.map = tex; material.needsUpdate = true; });

    const mesh = new THREE.Mesh(geometry, material);
    tiltGroup.add(mesh);
    meshes[data.name] = mesh;

    // 이름표 (Label) 생성 및 부착
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = data.name;
    const labelObject = new CSS2DObject(labelDiv);
    labelObject.position.set(0, data.radius + 15, 0); // 행성 위에 띄움
    mesh.add(labelObject); // 행성을 따라다님

    // 궤도 라인 강조
    const orbitLineGeom = new THREE.RingGeometry(data.distance - 1, data.distance + 1, 512);
    const orbitLineMat = new THREE.MeshBasicMaterial({ color: data.color, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const orbitLine = new THREE.Mesh(orbitLineGeom, orbitLineMat);
    orbitLine.rotation.x = Math.PI / 2;
    orbitGroup.add(orbitLine);

    // 토성 고리
    if (data.hasRing) {
        const ringGeom = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.5, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8c291, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh);
    }
});

// 7. Animation & Rendering
function animate() {
    requestAnimationFrame(animate);

    // 자전
    Object.values(meshes).forEach(mesh => {
        mesh.rotation.y += 0.005;
    });

    // 공전
    planetsData.forEach(data => {
        if (orbitGroups[data.name]) {
            orbitGroups[data.name].rotation.y += data.speed;
        }
    });

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
