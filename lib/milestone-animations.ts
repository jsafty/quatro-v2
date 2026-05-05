const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? "";
const GIPHY_TAGS = ["celebration", "congrats", "party", "excited", "winning"];

async function fetchRandomGifUrl(): Promise<string | null> {
  try {
    const tag = GIPHY_TAGS[Math.floor(Math.random() * GIPHY_TAGS.length)];
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${tag}&rating=g`
    );
    const json = await res.json();
    return (json?.data?.images?.downsized_medium?.url as string) ?? null;
  } catch {
    return null;
  }
}

function showGifOverlay(gifUrl: string, count: number): void {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
    background:rgba(0,0,0,0.6);
    animation:_msOverlayIn 0.25s ease forwards;
    cursor:pointer;
  `;

  if (!document.getElementById("_ms_styles")) {
    const style = document.createElement("style");
    style.id = "_ms_styles";
    style.textContent = `
      @keyframes _msOverlayIn  { from { opacity:0; } to { opacity:1; } }
      @keyframes _msOverlayOut { from { opacity:1; } to { opacity:0; } }
      @keyframes _msGifIn {
        from { transform:scale(0.88); opacity:0; }
        to   { transform:scale(1);    opacity:1; }
      }
    `;
    document.head.appendChild(style);
  }

  const headline = document.createElement("p");
  headline.textContent = `${count} tasks completed today!`;
  headline.style.cssText = `
    font-size:22px;font-weight:800;color:#ffffff;
    font-family:Inter,sans-serif;letter-spacing:-0.025em;
    margin:0;text-align:center;
    animation:_msGifIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
    text-shadow:0 2px 12px rgba(0,0,0,0.4);
  `;

  const img = document.createElement("img");
  img.src = gifUrl;
  img.style.cssText = `
    max-width:min(420px,90vw);max-height:60vh;
    border-radius:16px;object-fit:contain;
    animation:_msGifIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
    box-shadow:0 24px 64px rgba(0,0,0,0.4);
  `;

  overlay.append(headline, img);
  document.body.appendChild(overlay);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    overlay.style.animation = "_msOverlayOut 0.25s ease forwards";
    setTimeout(() => overlay.remove(), 250);
  }

  overlay.addEventListener("click", dismiss);
  setTimeout(dismiss, 3000);
}

export async function triggerMilestoneFirework(_cardRect: DOMRect): Promise<void> {
  const url = await fetchRandomGifUrl();
  if (url) showGifOverlay(url, 5);
}

export async function triggerMilestoneOverlay(): Promise<void> {
  const url = await fetchRandomGifUrl();
  if (url) showGifOverlay(url, 10);
}
