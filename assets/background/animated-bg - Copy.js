(() => {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d', { alpha: true });

  let w, h, dpr;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth;
    h = c.clientHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // Simple floating dots network
  const N = 80;
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3
  }));

  let raf = null;
  const loop = () => {
    ctx.clearRect(0, 0, w, h);

    // fade background very slightly to create trails
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    // Comment the next line if your theme already uses a light background
    // ctx.fillRect(0, 0, w, h);

    // update + draw
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,150,255,0.8)';
      ctx.fill();
    }

    // connect near points
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          const a = 1 - Math.sqrt(d2) / 120;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(130,170,255,${a * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(loop);
  };

  // Pause when tab hidden to save CPU
  const vis = () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { raf = requestAnimationFrame(loop); }
  };
  document.addEventListener('visibilitychange', vis);

  loop();
})();