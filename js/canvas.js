const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId = null;
let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener('touchmove', (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

// Highly distinct colors and explicitly defined palettes
const emotionProfiles = {
  joy: { 
      primary: '#FFE066', secondary: '#00F5D4', // Yellow & Cyan (Bright, happy)
      emojis: ["✨", "☀️", "😊", "💛"], move: 'explosive' 
  },
  calm: { 
      primary: '#48CAE4', secondary: '#CAF0F8', // Ocean blues
      emojis: ["☁️", "🍃", "🌊", "🧘"], move: 'fluid' 
  },
  sadness: { 
      primary: '#1D3557', secondary: '#457B9D', // Dark gloomy blues/grey
      emojis: ["💧", "🌧️", "💔", "🥀"], move: 'fall' 
  },
  anxiety: { 
      primary: '#F72585', secondary: '#CCFF33', // Glitchy Magenta and Volt Lime
      emojis: ["⚡", "🌀", "😰", "⚠️"], move: 'erratic' 
  },
  determination: { 
      primary: '#D62828', secondary: '#F77F00', // Intense Fire and Orange
      emojis: ["🔥", "💥", "💪", "🚀"], move: 'rise' 
  },
  exhaustion: { 
      primary: '#6C757D', secondary: '#ADB5BD', // Faded Ash Greys
      emojis: ["💨", "🌫️", "💤", "🍂"], move: 'dissolve' 
  },
  nostalgia: { 
      primary: '#CB997E', secondary: '#E0B1CB', // Sepia and Lavender
      emojis: ["🎞️", "🌙", "🕰️", "🌻"], move: 'spiral' 
  },
  gratitude: { 
      primary: '#2A9D8F', secondary: '#F4A261', // Spring Green and Soft Peach
      emojis: ["💖", "🌱", "🙏", "🌸"], move: 'expand' 
  },
  love: { 
      primary: '#FF0A54', secondary: '#FF7096', // Passionate Pinks and Reds
      emojis: ["❤️", "😍", "💞", "🌹"], move: 'fluid' 
  },
  anger: { 
      primary: '#9D0208', secondary: '#DC2F02', // Deep Reds and Blood Orange
      emojis: ["💥", "🔥", "😡", "💢"], move: 'erratic' 
  },
  confusion: { 
      primary: '#9D4EDD', secondary: '#7400B8', // Deep Violet and Purple
      emojis: ["🤔", "❓", "💫", "💭"], move: 'spiral' 
  },
  hope: { 
      primary: '#70D6FF', secondary: '#FF9770', // Sunrise colors (Light Blue & Peach)
      emojis: ["🕊️", "🌅", "⭐", "🦋"], move: 'rise' 
  },
  loneliness: { 
      primary: '#E0FBFC', secondary: '#98C1D9', // Ice white and Pale Blue
      emojis: ["🧊", "❄️", "👤", "🌌"], move: 'fall' 
  },
  surprise: { 
      primary: '#FFD60A', secondary: '#FF4D6D', // Bright Yellow and Hot Pink
      emojis: ["🎆", "😲", "🎉", "⚡"], move: 'explosive' 
  },
  default: { 
      primary: '#7C6DFA', secondary: '#2A2550', 
      emojis: ["✨", "🌌"], move: 'fluid' 
  }
};

let currentState = {
  emotion: 'default',
  speedMultiplier: 0.2,
  count: 60,
  sizeMultiplier: 3,
  movementType: 'fluid',
  intensity: 0.5
};

function resizeCanvas() {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Re-adjust particle positions relatively so they don't jump to top left on resize
  if (oldWidth && oldHeight && particles.length > 0) {
    particles.forEach(p => {
      p.x = (p.x / oldWidth) * canvas.width;
      p.y = (p.y / oldHeight) * canvas.height;
    });
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    // Increased base size for visual particles
    this.baseSize = Math.random() * 4 + 2; 
    this.size = this.baseSize;
    this.opacity = Math.random() * 0.5 + 0.3; // Minimum opacity to ensure visibility
    
    const profile = emotionProfiles[currentState.emotion] || emotionProfiles.default;
    this.color = Math.random() > 0.5 ? profile.primary : profile.secondary;
    
    // 25% chance of being an emoji instead of a standard shape
    this.isEmoji = Math.random() > 0.75;
    if (this.isEmoji) {
        this.emojiChar = profile.emojis[Math.floor(Math.random() * profile.emojis.length)];
        this.baseSize *= 3; // emojis need to be visible
    }

    this.life = Math.random() * 1000;
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    // Scale effects with intensity, limiting exaggerated drops for fragile emotions
    let intensityFactor = Math.max(0.5, currentState.intensity);
    let speed = currentState.speedMultiplier * (0.5 + (intensityFactor * 0.8));
    let type = currentState.movementType;
    this.size = this.baseSize * currentState.sizeMultiplier * (0.8 + (intensityFactor * 0.5));
    this.life += 1;

    // Mouse Interaction (Push away)
    if (mouse.x && mouse.y && type !== 'dissolve') {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 120) {
        this.x += (dx / distance) * 3;
        this.y += (dy / distance) * 3;
      }
    }

    if (type === 'explosive') {
      this.x += this.vx * speed * 4;
      this.y += this.vy * speed * 4;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      return;
    } else if (type === 'fluid') {
      this.x += Math.sin(this.life * 0.02) * speed * 2 + this.vx * speed;
      this.y += Math.cos(this.life * 0.02) * speed * 2 + this.vy * speed;
    } else if (type === 'fall') {
      this.y += (Math.abs(this.vy) * speed * 3) + 1; 
      this.x += Math.sin(this.life * 0.05) * speed * 0.5;
    } else if (type === 'erratic') {
      this.angle += (Math.random() - 0.5) * 2;
      this.x += Math.cos(this.angle) * speed * 12; // Very fast
      this.y += Math.sin(this.angle) * speed * 12;
    } else if (type === 'rise') {
      this.y -= (Math.abs(this.vy) * speed * 4) + 1;
      this.x += Math.sin(this.life * 0.03) * speed * 2;
    } else if (type === 'spiral') {
      let dx = this.x - canvas.width / 2;
      let dy = this.y - canvas.height / 2;
      let angle = Math.atan2(dy, dx) + 0.02 * speed;
      let radius = Math.sqrt(dx * dx + dy * dy) + Math.sin(this.life*0.01)*2;
      this.x = canvas.width / 2 + Math.cos(angle) * (radius > 10 ? radius : 10);
      this.y = canvas.height / 2 + Math.sin(angle) * (radius > 10 ? radius : 10);
    } else if (type === 'expand') {
      let dx = this.x - canvas.width / 2;
      let dy = this.y - canvas.height / 2;
      this.x += dx * 0.01 * speed;
      this.y += dy * 0.01 * speed;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      return; 
    } else if (type === 'dissolve') {
      this.y += speed * 0.5;
      this.x += Math.sin(this.life * 0.01) * speed;
      this.opacity -= 0.003 * speed;
      if (this.opacity <= 0) {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.8 + 0.2;
      }
      return;
    }

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    let type = currentState.movementType;
    
    ctx.globalAlpha = this.opacity;
    
    if (this.isEmoji) {
      ctx.font = `${this.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Emoji particles can subtly rotate in some motions
      ctx.save();
      ctx.translate(this.x, this.y);
      if (type === 'spiral' || type === 'erratic') {
          ctx.rotate(this.angle || this.life * 0.05);
      }
      ctx.fillText(this.emojiChar, 0, 0);
      ctx.restore();
    } else {
      ctx.beginPath();
      // Diverse shapes
      if (type === 'fall') {
        // Raindrops
        ctx.ellipse(this.x, this.y, this.size/2, this.size * 1.5, 0, 0, Math.PI * 2);
      } else if (type === 'erratic' || type === 'rise') {
        // Stars / Fire / Triangles
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.closePath();
      } else {
        // Fluid rounds
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      }
      
      ctx.fillStyle = this.color;
      ctx.shadowBlur = (type === 'explosive' || type === 'rise' || type === 'anxiety') ? 20 : 5;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1;
  }
}

function initParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  // Decreased distance to improve performance
  let connectDistance = 100;
  ctx.lineWidth = 1;
  let connectionCount = 0; // Prevent runaway O(N^2) lag
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      // Don't connect emojis to keep it clean
      if(particles[i].isEmoji || particles[j].isEmoji) continue;

      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      
      // Fast distance check before Math.sqrt to save CPU cycles
      if (Math.abs(dx) > connectDistance || Math.abs(dy) > connectDistance) continue;
      
      let dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < connectDistance) {
        ctx.beginPath();
        ctx.strokeStyle = particles[i].color;
        ctx.globalAlpha = (1 - dist / connectDistance) * 0.6 * particles[i].opacity;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        connectionCount++;
        
        // Strict rendering limit to save battery and frames
        if (connectionCount > 250) break;
      }
    }
    if (connectionCount > 250) break;
  }
  ctx.globalAlpha = 1;
}

function animate() {
  ctx.fillStyle = 'rgba(13, 13, 18, 0.4)'; // subtle trail
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => p.update());
  
  const type = currentState.movementType;
  if (type === 'fluid' || type === 'expand' || type === 'spiral' || type === 'rise') {
    drawConnections();
  }

  particles.forEach(p => p.draw());

  animationFrameId = requestAnimationFrame(animate);
}

function updateState(emotion, params, intensityArg) {
  currentState.emotion = emotion;
  // Fallback to 1 if intensity is not available
  const intensity = (intensityArg !== undefined && intensityArg !== "null") ? parseFloat(intensityArg) : 1.0; 
  currentState.intensity = Math.max(0.1, Math.min(1.0, intensity));

  currentState.speedMultiplier = params.particle_speed || 0.5;
  
  // Scale the basic quantity but limit drastically to max 110 to protect mobile devices
  // and guarantee at least 40 so it doesn't look completely empty.
  let baseCount = params.particle_count || 90;
  let targetCount = Math.floor(Math.max(40, baseCount * currentState.intensity));
  currentState.count = Math.min(100, targetCount); // Optimal balance: max 100, min 40
  
  currentState.sizeMultiplier = params.particle_size || 3;
  
  const profile = emotionProfiles[emotion] || emotionProfiles.default;
  currentState.movementType = profile.move;
  
  initParticles(currentState.count);
  
  // Inject CSS variables for UI styling
  document.documentElement.style.setProperty('--primary-color', profile.primary);
  document.documentElement.style.setProperty('--secondary-color', profile.secondary);
}

initParticles(80);
animate();

window.AuraCanvas = { updateState };
