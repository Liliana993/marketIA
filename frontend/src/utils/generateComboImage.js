const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImages(urls) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          if (!url) return resolve(null);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        })
    )
  );
}

export async function generateComboImage(combo) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#4f46e5');
  bg.addColorStop(1, '#7c3aed');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawRoundedRect(ctx, 30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(combo.name, CANVAS_WIDTH / 2, 90);

  if (combo.description) {
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const words = combo.description.split(' ');
    let line = '';
    let y = 125;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > CANVAS_WIDTH - 120) {
        ctx.fillText(line.trim(), CANVAS_WIDTH / 2, y);
        line = word + ' ';
        y += 26;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), CANVAS_WIDTH / 2, y);
  }

  const productImages = (combo.items || [])
    .map((item) => item.product?.image)
    .filter(Boolean);

  const images = await loadImages(productImages);
  const validImages = images.filter(Boolean);

  if (validImages.length > 0) {
    const cols = Math.min(validImages.length, 3);
    const rows = Math.ceil(validImages.length / cols);
    const imgSize = 180;
    const gap = 20;
    const gridW = cols * imgSize + (cols - 1) * gap;
    const gridH = rows * imgSize + (rows - 1) * gap;
    const startX = (CANVAS_WIDTH - gridW) / 2;
    const startY = 170;

    validImages.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (imgSize + gap);
      const y = startY + row * (imgSize + gap);

      drawRoundedRect(ctx, x, y, imgSize, imgSize, 12);
      ctx.save();
      ctx.clip();

      const scale = Math.max(imgSize / img.width, imgSize / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, x + (imgSize - w) / 2, y + (imgSize - h) / 2, w, h);
      ctx.restore();

      drawRoundedRect(ctx, x, y, imgSize, imgSize, 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  const priceY = validImages.length > 0
    ? 170 + Math.ceil(validImages.length / 3) * 200 + 40
    : 300;

  if (combo.regularPrice) {
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Precio regular', CANVAS_WIDTH / 2, priceY);
    ctx.font = '22px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const regularText = `$${combo.regularPrice.toLocaleString('es-AR')}`;
    const regularWidth = ctx.measureText(regularText).width;
    ctx.fillText(regularText, CANVAS_WIDTH / 2, priceY + 28);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - regularWidth / 2 - 4, priceY + 24);
    ctx.lineTo(CANVAS_WIDTH / 2 + regularWidth / 2 + 4, priceY + 24);
    ctx.stroke();
  }

  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(`$${(combo.comboPrice || 0).toLocaleString('es-AR')}`, CANVAS_WIDTH / 2, priceY + 90);

  if (combo.discount > 0) {
    const badgeY = priceY + 110;
    drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 80, badgeY, 160, 36, 18);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`AHORRÁ $${combo.discount.toLocaleString('es-AR')}`, CANVAS_WIDTH / 2, badgeY + 25);
  }

  const footerY = CANVAS_HEIGHT - 80;

  drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 40, footerY - 45, 80, 80, 16);
  ctx.fillStyle = '#6366f1';
  ctx.fill();
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('M', CANVAS_WIDTH / 2, footerY + 10);

  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('MARKETIA', CANVAS_WIDTH / 2, footerY + 50);

  return canvas.toDataURL('image/png');
}
