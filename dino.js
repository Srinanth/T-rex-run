const dino = document.getElementById('dino');
const cactusContainer = document.getElementById('cactus-container');
const gameOver = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const groundrun = document.getElementById('ground')

let isJumping = false;
let isDucking = false;
let score = 0;
let gameRunning = true;
let lastObstacleTime = 0;
let spawnInterval = 2000; 
let lastbird = false;
let lastcactus = false;

const userName = localStorage.getItem('userName')|| 'player';

const gravity = 0.6; 
let velocity = 0; 

//  samurai and dragon imgs
const cactusTypes = [
  { src: 'DINO IMG/ezgif-4-5d3febca02.gif', probability: 0.6 },
  { src: 'DINO IMG/ezgif-4-1f82bc2457.gif', probability: 0.3 },
  { src: 'DINO IMG/ragna-bloodedge.gif', probability: 0.2 }
];
const birdImg = 'DINO IMG/flying.gif';
// JUMP logic
function jump() {
  if (!gameRunning || isJumping) return;
  isJumping = true;
  velocity = 12; 

  let position = parseInt(getComputedStyle(dino).bottom);

  const jumpInterval = setInterval(() => {
    if (velocity <= 0 && position <= 10) {
     
      clearInterval(jumpInterval);
      dino.style.bottom = '10px';
      isJumping = false;
    } else {
      
      velocity -= gravity;
      position += velocity;
      dino.style.bottom = `${position}px`;
    }
  }, 20); 
}

// Duck Logic
function duck() {
  if (!gameRunning || isDucking || isJumping) return;
  isDucking = true;
  dino.src = 'DINO IMG/duck.gif';

  setTimeout(() => {
    dino.src = 'DINO IMG/dinosaur-dancing-with-sunglass.gif';
    isDucking = false;
  }, 1000);
}

function createObstacle() {
  const now = Date.now();
  if (now - lastObstacleTime < spawnInterval) return;

  const random = Math.random();
  let obstacle;

  if (random < 0.2 && !lastbird) {
    // spawn a drag
    obstacle = document.createElement('img'); 
    obstacle.src = birdImg;    
    obstacle.classList.add('bird');
    
    obstacle.style.top = `2px`;
    lastbird = true;

      if(lastbird ===true)
        lastcactus = false;



  } else {
    // Spawn a samurai
    const selectedCactus = cactusTypes[Math.floor(Math.random([{ src: 'DINO IMG/ezgif-4-5d3febca02.gif', probability: 0.6 },
      { src: 'DINO IMG/ezgif-4-1f82bc2457.gif', probability: 0.3 },
      { src: 'DINO IMG/ragna-bloodedge.gif', probability: 0.2 }]))];
    obstacle = document.createElement('img');
    obstacle.src = selectedCactus.src;
    obstacle.classList.add('cactus');
    lastbird = false;
    lastcactus = true;
    
  }
  obstacle.style.right = '-50px';
  cactusContainer.appendChild(obstacle); 

  obstacle.addEventListener('animationend', () => {
    obstacle.remove();
  });

  lastObstacleTime = now;
}

// Detect Collision with samu or dra
function detectCollision() {
  const dinoRect = dino.getBoundingClientRect();
  const obstacles = document.querySelectorAll('.cactus, .bird');

  obstacles.forEach((obstacle) => {
    const obstacleRect = obstacle.getBoundingClientRect();

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



// Show Game Over Screen
function gameOverScreen() {
  cactusContainer.innerHTML = '';
  dino.src = 'DINO IMG/dead.gif';
  gameOver.style.display = 'block';
  restartBtn.style.display='block';
  gameRunning = false;
  groundrun.classList.add('paused');



  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({name:userName, score:score });
  leaderboard.sort((a, b)=> b.score-a.score);
  localStorage.setItem('leaderboard',JSON.stringify(leaderboard));


}
updateScore()


// Restart Game
restartBtn.addEventListener('click', () => {
  score = 0;
  spawnInterval = 2000; 
  gameRunning = true;
  dino.src = 'DINO IMG/dinosaur-dancing-with-sunglass.gif';
  gameOver.style.display = 'none';
  cactusContainer.innerHTML = '';
  lastbird = false;
  lastObstacleTime = 0
  lastcactus = false;
});

function updateScore() {
  if (gameRunning) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;


    if (score % 100 === 0) {
      increaseDifficulty();
    }
  }
}

function increaseDifficulty() {
  if (spawnInterval > 1000) {
    spawnInterval -= 200;
  }
}


//  Keyboard Inputs
document.addEventListener('keydown', (e) => {
  if (e.code === 'Arrowup' || e.code === 'Space') {
    jump();
  } else if (e.code === 'ArrowDown') {
    duck();
  }
});


function startObstacleSpawner() {
  setInterval(() => {
    if (gameRunning) createObstacle();
  }, 50); 
}

//  Collision Detection
setInterval(detectCollision, 50);

startObstacleSpawner();
setInterval(updateScore, 100);





