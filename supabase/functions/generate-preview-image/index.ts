
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";

serve(async () => {
  // Create a canvas with dimensions optimized for social media previews
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add decorative elements
  // Neural network pattern
  ctx.strokeStyle = "rgba(123, 97, 255, 0.15)";
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 100 + 50, 0, 2 * Math.PI);
    ctx.stroke();
    
    for (let j = 0; j < 5; j++) {
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // Add brain icon-like shape
  ctx.strokeStyle = "rgba(65, 191, 179, 0.6)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(width / 2 - 100, height / 2, 80, 100, 0, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Add neural connections
  ctx.beginPath();
  ctx.ellipse(width / 2 + 50, height / 2 - 20, 70, 90, Math.PI / 4, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Connect the lobes
  ctx.beginPath();
  ctx.moveTo(width / 2 - 50, height / 2 - 40);
  ctx.lineTo(width / 2 + 20, height / 2 - 60);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, height / 2);
  ctx.lineTo(width / 2 + 10, height / 2 - 10);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(width / 2 - 60, height / 2 + 30);
  ctx.lineTo(width / 2 + 30, height / 2 + 20);
  ctx.stroke();

  // Add site title
  ctx.font = "bold 84px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("MindBoggle", width / 2, height / 2 - 40);

  // Add tagline with gradient
  const taglineGradient = ctx.createLinearGradient(width / 2 - 300, height / 2 + 40, width / 2 + 300, height / 2 + 40);
  taglineGradient.addColorStop(0, "#7B61FF");
  taglineGradient.addColorStop(1, "#41BFB3");
  
  ctx.font = "40px Arial, sans-serif";
  ctx.fillStyle = taglineGradient;
  ctx.fillText("Train Your Brain. Stay Sharp.", width / 2, height / 2 + 40);

  // Add subtitle
  ctx.font = "28px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText("AI-Powered Cognitive Training", width / 2, height / 2 + 100);

  // Convert canvas to PNG
  const pngData = canvas.toBuffer("image/png");

  return new Response(pngData, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
  });
});
