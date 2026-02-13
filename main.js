import * as THREE from 'three';

// 1. 장면 생성
const scene = new THREE.Scene();

// 2. 카메라 설정 (시야각, 종횡비, 근거리, 원거리)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

// 3. 렌더러 설정
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 태양 만들기
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // 노란색
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 5. 지구 만들기
const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x2233ff }); // 파란색
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 6. 조명 추가 (지구가 빛을 받으려면 필요함)
const light = new THREE.PointLight(0xffffff, 2, 100);
scene.add(light);

// 애니메이션 변수
let angle = 0;
const distance = 10; // 태양과 지구 사이의 거리

// 7. 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    // 지구 공전 로직 (삼각함수 활용)
    angle += 0.01;
    earth.position.x = Math.cos(angle) * distance;
    earth.position.z = Math.sin(angle) * distance;

    // 자전 효과
    sun.rotation.y += 0.005;
    earth.rotation.y += 0.02;

    renderer.render(scene, camera);
}

// 창 크기 조절 대응
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
