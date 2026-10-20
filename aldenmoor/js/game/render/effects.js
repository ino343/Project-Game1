/**
 * Rendering: combat effects, projectiles and click markers.
 */
function drawFx() {
  for (const e of fx) {
    const k = e.t / e.dur,
      x = e.x - cam.x,
      y = e.y - cam.y;
    if (e.k === 'arc') {
      ctx.globalAlpha = (1 - k) * 0.85;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = 7 * (1 - k) + 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x, y - 14, e.r * (0.7 + 0.3 * k), e.a - e.arc / 2, e.a + e.arc / 2);
      ctx.stroke();
      ctx.globalAlpha = (1 - k) * 0.18;
      ctx.fillStyle = e.col;
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.arc(x, y - 14, e.r, e.a - e.arc / 2, e.a + e.arc / 2);
      ctx.fill();
    } else if (e.k === 'ring') {
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x, y - 4, e.r * (0.3 + 0.7 * k), e.r * (0.3 + 0.7 * k) * 0.7, 0, 0, 6.28);
      ctx.stroke();
      if (e.fill) {
        ctx.globalAlpha = (1 - k) * 0.18;
        ctx.fillStyle = e.col;
        ctx.fill();
      }
    } else if (e.k === 'puff') {
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = e.col;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(e.a) * e.sp * k,
        y - 10 + Math.sin(e.a) * e.sp * k - k * 14,
        5 * (1 - k) + 1,
        0,
        6.28,
      );
      ctx.fill();
    } else if (e.k === 'dust') {
      ctx.globalAlpha = (1 - k) * 0.5;
      ctx.fillStyle = e.col;
      const dr = e.s * (0.6 + 1.2 * k);
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(e.a) * e.sp * k, y - 1 - k * 7 + Math.sin(e.a) * e.sp * k * 0.4, dr, dr * 0.7, 0, 0, 6.28);
      ctx.fill();
    } else if (e.k === 'ghost') {
      ctx.globalAlpha = (1 - k) * 0.35;
      ctx.fillStyle = e.col;
      ctx.beginPath();
      ctx.ellipse(x, y - 18, 10, 18, 0, 0, 6.28);
      ctx.fill();
    } else if (e.k === 'hit') {
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.moveTo(x + 8, y - 8);
      ctx.lineTo(x - 8, y + 8);
      ctx.stroke();
    } else if (e.k === 'arrow') {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = 2;
      const yy = y - 60 * (1 - k);
      ctx.beginPath();
      ctx.moveTo(x, yy - 18);
      ctx.lineTo(x, yy);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  for (const z of zones) {
    const x = z.x - cam.x,
      y = z.y - cam.y;
    ctx.strokeStyle = z.col;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, z.r, z.r * 0.7, 0, 0, 6.28);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = z.col;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const p of projs) {
    const x = p.x - cam.x,
      y = p.y - cam.y - (p.lift || 0);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.a);
    ctx.strokeStyle = p.col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.fillStyle = '#e8eef2';
    ctx.beginPath();
    ctx.moveTo(6, -3);
    ctx.lineTo(12, 0);
    ctx.lineTo(6, 3);
    ctx.fill();
    ctx.restore();
  }
  for (const c of clicks) {
    ctx.globalAlpha = 1 - c.t * 2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(c.x - cam.x, c.y - cam.y, 6 + c.t * 30, (6 + c.t * 30) * 0.6, 0, 0, 6.28);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
