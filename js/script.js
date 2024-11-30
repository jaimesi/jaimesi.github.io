const canvas = document.getElementById('bubbles-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle canvas resizing
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // Reinitialize particles
});

// Particle class
class Particle {
    constructor(x, y) {
        this.x = Math.random() * canvas.width; // Start at a random position
        this.y = Math.random() * canvas.height;
        this.originalX = x; // Target position
        this.originalY = y;
        this.radius = Math.random() * 9 + 6; // Larger radius (6px–15px)
        this.color = this.generateBubbleColor();
        this.dx = Math.random() * 2 - 1; // Random velocity
        this.dy = Math.random() * 2 - 1;
    }

    generateBubbleColor() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.3, // Inner circle
            this.x, this.y, this.radius // Outer circle
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Center: white highlight
        gradient.addColorStop(0.6, 'rgba(173, 216, 230, 0.5)'); // Middle: light blue
        gradient.addColorStop(1, 'rgba(135, 206, 250, 0.2)'); // Edge: transparent blue
        return gradient;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(mouse) {
        // Repel particles if mouse is close
        const distX = mouse.x - this.x;
        const distY = mouse.y - this.y;
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < 150) { // Larger interaction range
            const angle = Math.atan2(distY, distX);
            const force = (150 - distance) / 150;
            const forceX = Math.cos(angle) * force * 8; // Stronger push
            const forceY = Math.sin(angle) * force * 8;

            this.x -= forceX;
            this.y -= forceY;
        } else {
            // Slowly return to original position
            this.x += (this.originalX - this.x) * 0.07; // Faster return
            this.y += (this.originalY - this.y) * 0.07;
        }

        this.draw();
    }
}

// Generate particles based on text
let particles = [];
function initParticles() {
    particles = [];
    const text = 'Jaime Si';
    ctx.font = 'bold 300px "Lato", sans-serif';
    ctx.fillStyle = 'white';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text off-screen
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;
    ctx.fillText(text, textX, textY);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create particles for non-transparent pixels
    for (let y = 0; y < canvas.height; y += 12) { // Increased spacing (12px)
        for (let x = 0; x < canvas.width; x += 12) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 128) { // Check alpha channel (non-transparent)
                particles.push(new Particle(x, y));
            }
        }
    }
}

// Mouse interaction
const mouse = { x: undefined, y: undefined };
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => particle.update(mouse));
    requestAnimationFrame(animate);
}

// Initialize and start animation
initParticles();
animate();
