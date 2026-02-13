import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 800, 1500);
controls.update();

const textureLoader = new THREE.TextureLoader();

// 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 100000, 10000);
scene.add(sunLight);

// 실제 자전축 기울기(Axial Tilt) 데이터 포함
const planetsData = [
    { name: "mercury", radius: 7, distance: 160, speed: 0.04, inclination: 7.0, tilt: 0.03, color: 0x999999, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mercury.jpg' },
    { name: "venus", radius: 13, distance: 230, speed: 0.015, inclination: 3.4, tilt: 177.3, color: 0xffd393, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus_surface.jpg' },
    { name: "earth", radius: 14, distance: 310, speed: 0.01, inclination: 0.0, tilt: 23.5, color: 0x2277ff, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg' },
    { name: "mars", radius: 9, distance: 400, speed: 0.008, inclination: 1.85, tilt: 25.2, color: 0xff4000, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars.jpg' },
    { name: "jupiter", radius: 50, distance: 600, speed: 0.002, inclination: 1.3, tilt: 3.1, color: 0xe3a869, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg' },
    { name: "saturn", radius: 42, distance: 800, speed: 0.0009, inclination: 2.5, tilt: 26.7, color: 0xf5e1a4, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn.jpg', hasRing: true },
    { name: "uranus", radius: 24, distance: 1000, speed: 0.0004, inclination: 0.77, tilt: 97.8, color: 0xb4e8f0, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/uranus.jpg' },
    { name: "neptune", radius: 23, distance: 1200, speed: 0.0001, inclination: 1.77, tilt: 28.3, color: 0x3d5eff, texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/neptune.jpg' }
];

const meshes = {};
const orbitGroups = {};

// 태양 생성
const sunGeometry = new THREE.SphereGeometry(120, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xff3300, emissiveIntensity: 1.8, color: 0xffaa00
});
textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg', (tex) => {
    sunMaterial.map = tex; sunMaterial.emissiveMap = tex; sunMaterial.needsUpdate = true;
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);
meshes["sun"] = sun;

planetsData.forEach(data => {
    // 1. 공전 그룹 (Orbit)
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.z = THREE.MathUtils.degToRad(data.inclination);
    scene.add(orbitGroup);
    orbitGroups[data.name] = orbitGroup;

    // 2. 자전축 기울기 그룹 (Tilt)
    const tiltGroup = new THREE.Group();
    tiltGroup.position.x = data.distance;
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.tilt); // 자전축 각도 고정
    orbitGroup.add(tiltGroup);

    // 3. 행성 본체 (실제 자전은 여기서 발생)
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.7 });
    textureLoader.load(data.texture, (tex) => { material.map = tex; material.needsUpdate = true; });

    const mesh = new THREE.Mesh(geometry, material);
    tiltGroup.add(mesh); // 기울어진 그룹 안에 행성을 넣음
    meshes[data.name] = mesh;

    // 4. 궤도 선
    const orbitLineGeom = new THREE.RingGeometry(data.distance - 1.5, data.distance + 1.5, 512);
    const orbitLineMat = new THREE.MeshBasicMaterial({ color: data.color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const orbitLine = new THREE.Mesh(orbitLineGeom, orbitLineMat);
    orbitLine.rotation.x = Math.PI / 2;
    orbitGroup.add(orbitLine);

    // 토성 고리 (행성 메쉬가 아닌 tiltGroup에 추가하거나 행성에 직접 추가)
    if (data.hasRing) {
        const ringGeom = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.5, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8c291, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh); // 행성과 함께 기울어지도록 행성에 추가
    }
});

function animate() {
    requestAnimationFrame(animate);

    // 행성 자전 (기울어진 축을 기준으로 회전)
    Object.values(meshes).forEach(mesh => {
        mesh.rotation.y += 0.01;
    });

    // 행성 공전
    planetsData.forEach(data => {
        if (orbitGroups[data.name]) {
            orbitGroups[data.name].rotation.y += data.speed;
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
