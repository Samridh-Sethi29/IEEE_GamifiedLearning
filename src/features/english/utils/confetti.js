// High-Octane 60fps Canvas Confetti Engine
// Spawns celebratory burst cannons from bottom-center, left, and right

export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = [
    "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6",
    "#10b981", "#ef4444", "#38bdf8", "#fbbf24", "#a855f7", "#fb7185", "#34d399"
  ];

  const particles = [];
  const particleCount = 110;

  // Dual fountain origins: left & right bursts
  for (let i = 0; i < particleCount; i++) {
    const isLeft = i % 2 === 0;
    particles.push({
      x: isLeft ? width * 0.25 : width * 0.75,
      y: height * 0.7,
      vx: isLeft ? Math.random() * 14 - 3 : -Math.random() * 14 + 3,
      vy: -Math.random() * 18 - 8,
      size: Math.random() * 9 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 16,
      opacity: 1,
      gravity: 0.44,
      drag: 0.975,
      shape: Math.random() > 0.35 ? "rect" : "circle",
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  function render() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let aliveCount = 0;

    particles.forEach(p => {
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rSpeed;

      if (elapsed > 1100) {
        p.opacity -= 0.022;
      }

      if (p.opacity > 0 && p.y < height + 60) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    if (aliveCount > 0 && elapsed < 3500) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  render();
}
