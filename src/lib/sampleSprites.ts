// Helper function to create base64 sample sprite sheets programmatically
// This ensures the application is completely self-contained and does not require external assets.

export type SampleType = 'character' | 'items' | 'shapes';

export function getSampleSpriteSheet(type: SampleType): Promise<{ dataUrl: string; name: string }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve({ dataUrl: '', name: 'empty' });
      return;
    }

    if (type === 'character') {
      // 4 frames of 32x32 character = 128x32
      canvas.width = 128;
      canvas.height = 32;
      
      // Draw 4 walking character frames
      for (let i = 0; i < 4; i++) {
        const cx = i * 32;
        const cy = 0;
        drawPixelCharacter(ctx, cx, cy, i);
      }
      resolve({ dataUrl: canvas.toDataURL('image/png'), name: 'pixel_adventurer.png' });
      
    } else if (type === 'items') {
      // 8 items of 32x32 in a 4x2 grid = 128x64
      canvas.width = 128;
      canvas.height = 64;
      
      const items = [
        { type: 'potion', color: '#ff2a2a' }, // Health
        { type: 'potion', color: '#2a63ff' }, // Mana
        { type: 'sword' },
        { type: 'coin' },
        { type: 'shield' },
        { type: 'gem', color: '#b533ff' },   // Purple gem
        { type: 'potion', color: '#2aff57' }, // Poison
        { type: 'gem', color: '#00f6ff' }    // Cyan gem
      ];

      items.forEach((item, index) => {
        const gridX = index % 4;
        const gridY = Math.floor(index / 4);
        const cx = gridX * 32;
        const cy = gridY * 32;

        if (item.type === 'potion') {
          drawPotion(ctx, cx, cy, item.color || '#ff2a2a');
        } else if (item.type === 'sword') {
          drawSword(ctx, cx);
        } else if (item.type === 'coin') {
          drawCoin(ctx, cx, cy);
        } else if (item.type === 'shield') {
          drawShield(ctx, cx, cy);
        } else if (item.type === 'gem') {
          drawGem(ctx, cx, cy, item.color || '#ffae00');
        }
      });
      resolve({ dataUrl: canvas.toDataURL('image/png'), name: 'rpg_items.png' });
      
    } else {
      // 6 shapes of 32x32 in a 3x2 grid = 96x64
      canvas.width = 96;
      canvas.height = 64;
      
      const shapes: { type: 'circle' | 'square' | 'triangle' | 'star' | 'donut'; color: string }[] = [
        { type: 'circle', color: '#00ffff' },
        { type: 'square', color: '#ff00ff' },
        { type: 'triangle', color: '#ffff00' },
        { type: 'star', color: '#00ff00' },
        { type: 'donut', color: '#ff8800' },
        { type: 'square', color: '#ff0055' }
      ];

      shapes.forEach((shape, index) => {
        const gridX = index % 3;
        const gridY = Math.floor(index / 3);
        const cx = gridX * 32;
        const cy = gridY * 32;
        drawNeonShape(ctx, cx, cy, shape.type, shape.color);
      });
      resolve({ dataUrl: canvas.toDataURL('image/png'), name: 'neon_shapes.png' });
    }
  });
}

function drawPixelCharacter(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  // Draw a 24x24 character centered inside 32x32 box
  const px = cx + 4;
  const py = cy + 4;

  // Head (Skin)
  ctx.fillStyle = '#ffdbac';
  ctx.fillRect(px + 6, py + 4, 8, 8);

  // Hair (Brown)
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(px + 5, py + 2, 10, 3);
  ctx.fillRect(px + 5, py + 5, 2, 4);

  // Eyes (Blue)
  ctx.fillStyle = '#00a8ff';
  ctx.fillRect(px + 10, py + 6, 2, 2);

  // Shirt (Red)
  ctx.fillStyle = '#e84118';
  ctx.fillRect(px + 4, py + 12, 12, 8);

  // Pants (Blue)
  ctx.fillStyle = '#192a56';
  ctx.fillRect(px + 6, py + 20, 8, 4);

  // Shoes (Black) & Walk Cycle Leg Movement
  ctx.fillStyle = '#2f3640';
  if (frame === 0 || frame === 2) {
    // Standing
    ctx.fillRect(px + 6, py + 24, 2, 2);
    ctx.fillRect(px + 10, py + 24, 2, 2);
  } else if (frame === 1) {
    // Walking leg 1
    ctx.fillRect(px + 5, py + 23, 2, 2);
    ctx.fillRect(px + 10, py + 24, 2, 2);
  } else {
    // Walking leg 2
    ctx.fillRect(px + 6, py + 24, 2, 2);
    ctx.fillRect(px + 11, py + 23, 2, 2);
  }
}

function drawPotion(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  // Bottle Neck (Glass)
  ctx.fillStyle = 'rgba(245, 246, 250, 0.8)';
  ctx.fillRect(cx + 13, py(6), 6, 4);
  // Cork (Brown)
  ctx.fillStyle = '#9c5a21';
  ctx.fillRect(cx + 14, py(3), 4, 3);
  // Bottle Body
  ctx.fillStyle = 'rgba(245, 246, 250, 0.8)';
  ctx.fillRect(cx + 8, py(10), 16, 16);
  // Liquid inside
  ctx.fillStyle = color;
  ctx.fillRect(cx + 9, py(12), 14, 13);
  // Highlight (Glass shine)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(cx + 11, py(13), 2, 7);
  
  function py(val: number) { return cy + val + 3; }
}

function drawSword(ctx: CanvasRenderingContext2D, cx: number, cy: number = 0) {
  // Blade (Silver/Grey)
  ctx.fillStyle = '#dcdde1';
  ctx.fillRect(cx + 14, cy + 4, 4, 18);
  ctx.fillStyle = '#7f8c8d'; // Blade edge shadow
  ctx.fillRect(cx + 16, cy + 4, 2, 18);
  // Crossguard (Gold)
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(cx + 9, cy + 22, 14, 3);
  // Handle (Brown)
  ctx.fillStyle = '#8c7ae6';
  ctx.fillRect(cx + 14, cy + 25, 4, 5);
  // Pommel (Gold)
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(cx + 13, cy + 30, 6, 2);
}

function drawCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Gold coin outer ring
  ctx.fillStyle = '#e1b12c';
  ctx.beginPath();
  ctx.arc(cx + 16, cy + 16, 11, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ring
  ctx.fillStyle = '#f5cd79';
  ctx.beginPath();
  ctx.arc(cx + 16, cy + 16, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Center detail
  ctx.fillStyle = '#e1b12c';
  ctx.fillRect(cx + 14, cy + 12, 4, 8);
  ctx.fillRect(cx + 12, cy + 14, 8, 4);
}

function drawShield(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Shield shape (Wood/Iron border)
  ctx.fillStyle = '#78e08f'; // Main color (green)
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy + 5);
  ctx.lineTo(cx + 26, cy + 5);
  ctx.lineTo(cx + 26, cy + 15);
  ctx.quadraticCurveTo(cx + 26, cy + 25, cx + 16, cy + 29);
  ctx.quadraticCurveTo(cx + 6, cy + 25, cx + 6, cy + 15);
  ctx.closePath();
  ctx.fill();
  
  // Border (Steel/Grey)
  ctx.strokeStyle = '#485460';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  
  // Center metal cross
  ctx.fillStyle = '#dcdde1';
  ctx.fillRect(cx + 14, cy + 7, 4, 16);
  ctx.fillRect(cx + 10, cy + 13, 12, 4);
}

function drawGem(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + 16, cy + 4);
  ctx.lineTo(cx + 27, cy + 15);
  ctx.lineTo(cx + 16, cy + 28);
  ctx.lineTo(cx + 5, cy + 15);
  ctx.closePath();
  ctx.fill();
  
  // Gem facet highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.moveTo(cx + 16, cy + 4);
  ctx.lineTo(cx + 21, cy + 9);
  ctx.lineTo(cx + 16, cy + 16);
  ctx.closePath();
  ctx.fill();

  // Darker facets for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.moveTo(cx + 16, cy + 16);
  ctx.lineTo(cx + 27, cy + 15);
  ctx.lineTo(cx + 16, cy + 28);
  ctx.closePath();
  ctx.fill();
}

function drawNeonShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  type: 'circle' | 'square' | 'triangle' | 'star' | 'donut',
  color: string
) {
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  
  const x = cx + 16;
  const y = cy + 16;
  
  ctx.beginPath();
  if (type === 'circle') {
    ctx.arc(x, y, 9, 0, Math.PI * 2);
  } else if (type === 'square') {
    ctx.rect(x - 8, y - 8, 16, 16);
  } else if (type === 'triangle') {
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 9, y + 8);
    ctx.lineTo(x - 9, y + 8);
    ctx.closePath();
  } else if (type === 'donut') {
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
  } else if (type === 'star') {
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        x + Math.cos(((18 + i * 72) * Math.PI) / 180) * 10,
        y - Math.sin(((18 + i * 72) * Math.PI) / 180) * 10
      );
      ctx.lineTo(
        x + Math.cos(((54 + i * 72) * Math.PI) / 180) * 4,
        y - Math.sin(((54 + i * 72) * Math.PI) / 180) * 4
      );
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
  
  // Reset shadow settings for next draws
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
