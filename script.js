const para = document.querySelector('p');
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = 600);
const height = (canvas.height = 600);

const skullImg = new Image();
skullImg.src = 'https://cdn-icons-png.flaticon.com/128/12537/12537322.png'; 

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = random(1, 3);
    this.velX = random(-5, 5);
    this.velY = random(-5, 5);
    this.alpha = 1; 
    this.color = random(0, 1) < 0.5 ? '#00fff2' : '#ffae00';
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
    this.alpha -= 0.02; 
  }
}

const particles = [];

class Skull {
  constructor(x, y, velX, velY, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.size = size;
    this.exists = true;
    this.hue = 0;
    this.hit = 0;
  }

  draw() {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${this.hue}, 100%, 80%)`;
    ctx.drawImage(skullImg, this.x, this.y, this.size, this.size);
    if (this.hit > 0) {
      ctx.filter = `hue-rotate(${this.hue}deg) brightness(1.5)`;
      this.hit--; 
    } else {
      ctx.filter = `hue-rotate(${this.hue}deg)`;
    }
    ctx.drawImage(skullImg, this.x, this.y, this.size, this.size);
    ctx.restore();
  }

  update() {
    
    if ((this.x + this.size) >= width) {
      this.velX = -(Math.abs(this.velX));
    } else if (this.x <= 0) {
      this.velX = Math.abs(this.velX);
    }

    if ((this.y + this.size) >= height) {
      this.velY = -(Math.abs(this.velY));
    } else if (this.y <= 0) {
      this.velY = Math.abs(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect(skulls) {
    for (const skull of skulls) {
      if (!(this === skull) && skull.exists) {
        if (
          this.x < skull.x + skull.size &&
          this.x + this.size > skull.x &&
          this.y < skull.y + skull.size &&
          this.y + this.size > skull.y
        ) {
          
          this.hue = (this.hue + 45) % 360; 
          skull.hue = (skull.hue + 45) % 360;
          this.hit = 50;
          skull.hit = 50;

          
          let tempX = this.velX;
          let tempY = this.velY;
          this.velX = skull.velX;
          this.velY = skull.velY;
          skull.velX = tempX;
          skull.velY = tempY;

          
          const overlapX = (this.size - Math.abs(this.x - skull.x)) / 2;
          const overlapY = (this.size - Math.abs(this.y - skull.y)) / 2;
          
          if (this.x < skull.x) {
            this.x -= overlapX;
            skull.x += overlapX;
          } else {
            this.x += overlapX;
            skull.x -= overlapX;
          }

          if (this.y < skull.y) {
            this.y -= overlapY;
            skull.y += overlapY;
          } else {
            this.y += overlapY;
            skull.y -= overlapY;
          }

          
          for (let i = 0; i < 10; i++) {
            particles.push(new Particle(this.x + this.size / 2, this.y + this.size / 2, 'white'));
          }
        }
      }
    }
  } 
}

const skulls = [];
while (skulls.length < 10) {
  const size = 50;
  skulls.push(new Skull(
    random(0, width - size),
    random(0, height - size),
    random(-5, 5),
    random(-5, 5),
    size
  ));
}

function loop() {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(1, '#030301');
gradient.addColorStop(0.3, '#3c0650');
gradient.addColorStop(0.5, '#0E494F');
ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].draw();
    particles[i].update();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  for (const skull of skulls) {
    if (skull.exists) {
      skull.draw();
      skull.update();
      skull.collisionDetect(skulls);
    }
  }
  
  requestAnimationFrame(loop);
} 

skullImg.onload = () => loop();