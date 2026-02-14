window.onload = function() {
    const canvas = document.getElementById("solarCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // 화면 크기 설정
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // 상호작용 상태
    let scale = 1.0;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const planets = [
        { name: "Sun", color: "#FDB813", radius: 40, distance: 0, speed: 0, angle: 0 },
        { name: "Mercury", color: "#A5A5A5", radius: 5, distance: 80, speed: 0.02, angle: Math.random() * Math.PI * 2 },
        { name: "Venus", color: "#E3BB76", radius: 10, distance: 120, speed: 0.015, angle: Math.random() * Math.PI * 2 },
        { name: "Earth", color: "#2271B3", radius: 11, distance: 170, speed: 0.01, angle: Math.random() * Math.PI * 2 },
        { name: "Mars", color: "#E27B58", radius: 8, distance: 220, speed: 0.008, angle: Math.random() * Math.PI * 2 },
        { name: "Jupiter", color: "#D39C7E", radius: 25, distance: 300, speed: 0.005, angle: Math.random() * Math.PI * 2 },
        { name: "Saturn", color: "#C5AB6E", radius: 20, distance: 380, speed: 0.003, angle: Math.random() * Math.PI * 2 },
        { name: "Uranus", color: "#B5E3E3", radius: 15, distance: 450, speed: 0.002, angle: Math.random() * Math.PI * 2 },
        { name: "Neptune", color: "#6081FF", radius: 14, distance: 510, speed: 0.001, angle: Math.random() * Math.PI * 2 },
    ];

    // 이벤트 리스너
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        scale -= e.deltaY * zoomSpeed;
        scale = Math.min(Math.max(0.1, scale), 5);
    }, { passive: false });

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
        if (isDragging) {
            offsetX += e.clientX - lastMouseX;
            offsetY += e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    window.addEventListener("mouseup", () => isDragging = false);

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);

        planets.forEach(p => {
            if (p.distance > 0) {
                ctx.beginPath();
                ctx.arc(0, 0, p.distance, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            const x = Math.cos(p.angle) * p.distance;
            const y = Math.sin(p.angle) * p.distance;

            ctx.beginPath();
            ctx.arc(x, y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            if(p.name === "Sun") {
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.color;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "white";
            ctx.font = `${12 / scale}px Arial`;
            ctx.fillText(p.name, x - 10, y + p.radius + (15 / scale));
            
            p.angle += p.speed;
        });

        ctx.restore();
        requestAnimationFrame(draw);
    }
    draw();
};
