const dino = document.getElementById('dino');
const samuraiCon = document.getElementById('samurai-container');
const gameOver = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const groundrun = document.getElementById('ground')

let isJumping = false;
let isDucking = false;
let score = 0;
let gameRunning = true;
let lastObstacleTime = 0;
let obstacleSpeed = 2; 
let spawnInterval = 3000;
let lastdragon = false;

const userName = localStorage.getItem('userName') || 'player';

const gravity = 0.6; 
let velocity = 0; 

const samuraiTypes = [
  { src: './DINO IMG/ezgif-4-5d3febca02.gif', type: 'single' },
  { src: './DINO IMG/ezgif-4-1f82bc2457.gif', type: 'double' },
  { src: './DINO IMG/ragna-bloodedge.gif', type: 'triple' }
];
const Dragon = './DINO IMG/flying.gif';

function jump() {
  if (!gameRunning || isJumping) return;
  isJumping = true;

  const isMobile = window.innerWidth <= 768;
  const jumpPower = isMobile ? 10 : 12; 
  const gravity = isMobile ? 0.22 : 0.4;

  velocity = jumpPower; 
  let position = parseInt(getComputedStyle(dino).bottom);
  let top = false;

  const jumpInterval = setInterval(() => {
    if (velocity <= 0 && !top) {
      top = true;
    }

    const currentGravity = top
      ? gravity * (isMobile ? 1.05 : 1.2)
      : gravity;

    velocity -= currentGravity;
    position += velocity;

    if (position <= 10) {
      clearInterval(jumpInterval);
      dino.style.bottom = '10px';
      isJumping = false;
      return;
    }

    dino.style.bottom = `${position}px`;
  }, 16); 
}


function duck() {
  if (!gameRunning || isDucking || isJumping) return;
  isDucking = true;
  dino.src = './DINO IMG/duck.gif';
  dino.style.height = '30px';

  setTimeout(() => {
    dino.src = './DINO IMG/dinosaur-dancing-with-sunglass.gif';
    dino.style.height = '60px';
    isDucking = false;
  }, 1000);
}

function createObstacle() {
  const now = Date.now();
  if (now - lastObstacleTime < spawnInterval) return;

  const random = Math.random();
  let obstacle;

  if (random < 0.2 && !lastdragon) {
    obstacle = document.createElement('img'); 
    obstacle.src = Dragon;    
    obstacle.classList.add('dragon', 'moving-obstacle');
    obstacle.style.bottom = '55px'; 
    obstacle.style.animationDuration = `${9000 / obstacleSpeed}ms`;
    lastdragon = true;
  } else {
    const selectedSamurai = samuraiTypes[Math.floor(Math.random() * samuraiTypes.length)];
    obstacle = document.createElement('img');
    obstacle.src = selectedSamurai.src;
    obstacle.classList.add('samurai', selectedSamurai.type, 'moving-obstacle');
    obstacle.style.bottom = '10px';
    obstacle.style.animationDuration = `${8000 / obstacleSpeed}ms`;
    lastdragon = false;
  }
  
  obstacle.style.right = '-50px';
  samuraiCon.appendChild(obstacle);

  obstacle.addEventListener('animationend', () => {
    obstacle.remove();
  });

  lastObstacleTime = now;
}

function detectCollision() {
  if (!gameRunning) return;
  
  const dinoRect = dino.getBoundingClientRect();
  const obstacles = document.querySelectorAll('.samurai, .dragon');

  obstacles.forEach((obstacle) => {
    const obstacleRect = obstacle.getBoundingClientRect();

    if (obstacle.classList.contains('dragon') && isDucking) {
      return; 
    }

    if (
      dinoRect.right > obstacleRect.left &&
      dinoRect.left < obstacleRect.right &&
      dinoRect.bottom > obstacleRect.top &&
      dinoRect.top < obstacleRect.bottom
    ) {
      gameOverScreen();
    }
  });
}

function gameOverScreen() {
  samuraiCon.innerHTML = '';
  dino.src = './DINO IMG/dead.gif';
  gameOver.style.display = 'block';
  restartBtn.style.display = 'block';
  gameRunning = false;
  groundrun.classList.add('paused');
  document.getElementById('final-score').textContent = score;

  document.getElementById('game-over').style.display = 'block';

  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({name: userName, score: score});
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

restartBtn.addEventListener('click', () => {
  score = 0;
  obstacleSpeed = 2; 
  gameRunning = true;
  dino.src = './DINO IMG/dinosaur-dancing-with-sunglass.gif';
  dino.style.height = '60px';
  gameOver.style.display = 'none';
  restartBtn.style.display = 'none';
  samuraiCon.innerHTML = '';
  lastdragon = false;
  lastObstacleTime = 0;
  groundrun.classList.remove('paused');
});

function updateScore() {
  if (gameRunning) {
    score++;
    scoreDisplay.textContent = `${userName}: ${score}`;

    if (score % 100 === 0) {
      obstacleSpeed += 0.2;
      console.log(`Difficulty increased! Speed: ${obstacleSpeed}`);
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'Space') {
    jump();
  } else if (e.code === 'ArrowDown') {
    duck();
  }
});

document.addEventListener('touchstart', handleTouch);
document.addEventListener('click', handleClick);

function handleTouch(e) {
  e.preventDefault();
  
  const touchY = e.touches[0].clientY;
  const screenHeight = window.innerHeight;

  if (touchY < screenHeight * 0.6) {
    jump();
  } 
  else {
    duck();
  }
}


function handleClick(e) {
  const clickY = e.clientY;
  const screenHeight = window.innerHeight;
  
  if (clickY < screenHeight * 0.6) {
    jump();
  } else {
    duck();
  }
}

const jumpBtn = document.getElementById('jumpBtn');
const duckBtn = document.getElementById('duckBtn');

jumpBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  jump();
});

duckBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  duck();
});

jumpBtn.addEventListener('click', jump);
duckBtn.addEventListener('click', duck);
function startObstacleSpawner() {
  setInterval(() => {
    if (gameRunning) createObstacle();
  }, 50);
}

startObstacleSpawner();
setInterval(detectCollision, 50);
setInterval(updateScore, 100);