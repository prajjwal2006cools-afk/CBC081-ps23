// Helper to generate simulated leaf image files for 1-click testing
export function createSampleLeafFile(sampleType) {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 300, 300);

  // Leaf Base
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(150, 150, 85, 125, 0, 0, Math.PI * 2);

  if (sampleType === "tomato_healthy") {
    ctx.fillStyle = "#16a34a"; // Vibrant healthy green
  } else if (sampleType === "apple_scab") {
    ctx.fillStyle = "#65a30d"; // Olive apple green
  } else {
    ctx.fillStyle = "#22c55e"; // Standard leaf green
  }
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#15803d";
  ctx.stroke();

  // Leaf Midrib Vein
  ctx.beginPath();
  ctx.moveTo(150, 35);
  ctx.lineTo(150, 270);
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Lateral Veins
  for (let y = 70; y < 240; y += 30) {
    ctx.beginPath();
    ctx.moveTo(150, y);
    ctx.lineTo(95, y - 20);
    ctx.moveTo(150, y);
    ctx.lineTo(205, y - 20);
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Disease spots if diseased
  if (sampleType === "tomato_late_blight") {
    ctx.fillStyle = "#451a03"; // Dark water-soaked lesions
    ctx.beginPath();
    ctx.ellipse(115, 110, 22, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(180, 170, 26, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(135, 215, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (sampleType === "apple_scab") {
    ctx.fillStyle = "#3f2e18"; // Brown scab spots
    ctx.beginPath();
    ctx.arc(130, 95, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(165, 140, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(120, 185, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const fileName = `${sampleType}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.95);
  });
}
