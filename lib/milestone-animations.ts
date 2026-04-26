const COLORS = ['#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#D4537E', '#7F77DD', '#EF9F27'];

function injectStyles() {
  if (document.getElementById('_ms_styles')) return;
  const style = document.createElement('style');
  style.id = '_ms_styles';
  style.textContent = `
    @keyframes _msConfettiFall {
      from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      to   { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
    }
    @keyframes _msOverlayIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes _msOverlayOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes _msCardIn {
      from { transform: scale(0.85); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    @keyframes _msEmojiIn {
      from { transform: scale(0.3) rotate(-10deg); }
      to   { transform: scale(1)   rotate(0deg);   }
    }
  `;
  document.head.appendChild(style);
}

export function triggerMilestoneFirework(cardRect: DOMRect): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const cx = cardRect.left + cardRect.width / 2;
  const cy = cardRect.top + cardRect.height / 2;

  const particles = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
    };
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.vy += 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.018;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  }

  requestAnimationFrame(animate);
}

export function triggerMilestoneOverlay(): void {
  injectStyles();

  const toRemove: HTMLElement[] = [];

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.45);
    display:flex;align-items:center;justify-content:center;
    animation:_msOverlayIn 0.3s ease forwards;
  `;
  toRemove.push(overlay);

  const card = document.createElement('div');
  card.style.cssText = `
    background:white;border-radius:20px;padding:28px 32px;max-width:300px;width:100%;
    text-align:center;position:relative;overflow:hidden;
    animation:_msCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;

  const emoji = document.createElement('div');
  emoji.textContent = '🎉';
  emoji.style.cssText = `
    font-size:56px;margin-bottom:12px;display:block;
    animation:_msEmojiIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;

  const headline = document.createElement('p');
  headline.textContent = '10 tasks today!';
  headline.style.cssText = `
    font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;
    font-family:Inter,sans-serif;letter-spacing:-0.025em;
  `;

  const sub = document.createElement('p');
  sub.textContent = "You're absolutely crushing it.";
  sub.style.cssText = `
    font-size:14px;color:#64748b;font-family:Inter,sans-serif;margin:0 0 20px;
  `;

  const barOuter = document.createElement('div');
  barOuter.style.cssText = `
    position:absolute;bottom:0;left:0;right:0;height:4px;
    background:#e2e8f0;border-radius:0 0 20px 20px;overflow:hidden;
  `;
  const bar = document.createElement('div');
  bar.style.cssText = `height:100%;width:100%;background:#1D9E75;transition:width 3s linear;`;
  barOuter.appendChild(bar);

  card.append(emoji, headline, sub, barOuter);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Two rAFs ensure the browser has painted width:100% before transitioning to 0%
  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = '0%'; }));

  // 60 confetti pieces
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      position:fixed;top:-20px;left:${Math.random() * 100}vw;
      width:${size}px;height:${size}px;
      background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation:_msConfettiFall ${1.5 + Math.random() * 2}s ${Math.random() * 0.8}s ease-in forwards;
      z-index:10000;pointer-events:none;
    `;
    toRemove.push(piece);
    document.body.appendChild(piece);
  }

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    overlay.style.animation = '_msOverlayOut 0.3s ease forwards';
    overlay.removeEventListener('click', dismiss);
    setTimeout(() => toRemove.forEach((el) => el.remove()), 300);
  }

  overlay.addEventListener('click', dismiss);
  setTimeout(dismiss, 3200);
}
