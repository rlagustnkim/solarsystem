const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- 상호작용을 위한 상태 변수 ---
let scale = 1;          // 확대/축소 비율
let offsetX = 0;        // 화면 가로 이동 거리
let offsetY = 0;        // 화면 세로 이동 거리
let isDragging = false; // 드래그 상태 확인
let lastMouseX = 0;
let lastMouseY = 0;

// 행성 데이터 (기존 데이터 구조 유지)
const planets = [
    { name: "Sun", color: "yellow", radius: 40, distance: 0, speed: 0, angle: 0 },
    { name: "Mercury", color: "gray", radius: 5, distance: 70, speed: 0.047, angle: Math.random() * Math.PI * 2 },
    { name: "Venus", color: "orange", radius: 10, distance: 100, speed: 0.035, angle: Math.random() * Math.PI * 2 },
    { name: "Earth", color: "blue", radius: 11, distance: 140, speed: 0.029, angle: Math.random() * Math.PI * 2 },
    { name: "Mars", color: "red", radius: 8, distance: 180, speed: 0.024, angle: Math.random() * Math.PI * 2 },
    { name: "Jupiter", color: "brown", radius: 25, distance: 260, speed: 0.013, angle: Math.random() * Math.PI * 2 },
    { name: "Saturn", color: "khaki", radius: 20, distance: 340, speed: 0.009, angle: Math.random() * Math.PI * 2 },
    { name: "Uranus", color: "lightblue", radius: 15, distance: 400, speed: 0.006, angle: Math.random() * Math.PI * 2 },
    { name: "Neptune", color: "darkblue", radius: 14, distance: 460, speed: 0.005, angle: Math.random() * Math.PI * 2 },
];

// --- 마우스 이벤트 리스너 추가 ---

// 1. 휠 이벤트 (확대/축소)
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    scale -= e.deltaY * zoomSpeed;
    scale = Math.min(Math.max(0.1, scale), 5); // 최소 0.1배 ~ 최대 5배 제한
}, { passive: false });

// 2. 마우스 클릭 시작 (드래그 시작)
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

// 3. 마우스 이동 (시점 이동)
window.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        
        offsetX += dx;
        offsetY += dy;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

// 4. 마우스 클릭 해제
window.addEventListener("mouseup", () => {
    isDragging = false;
});

function draw() {
    // 배경 초기화
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // 현재 캔버스 상태 저장
    
    // 화면 중앙 설정 및 마우스 조작(확대/이동) 적용
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.scale(scale, scale);

    planets.forEach((planet) => {
        // 공전 궤도 그리기
        if (planet.distance > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, planet.distance, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.stroke();
        }

        // 행성 위치 계산
        const x = Math.cos(planet.angle) * planet.distance;
        const y = Math.sin(planet.angle) * planet.distance;

        // 행성 그리기
        ctx.beginPath();
        ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();

        // 행성 이름 표시 (확대해도 글자 크기가 유지되게 하려면 추가 로직 필요하지만 기본 구현 유지)
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(planet.name, x, y + planet.radius + 15);

        // 각도 업데이트 (공전)
        planet.angle += planet.speed;
    });

    ctx.restore(); // 캔버스 상태 복구 (다음 프레임을 위해)

    requestAnimationFrame(draw);
}

// 윈도우 리사이즈 대응
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

draw();
