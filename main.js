const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 500;

const jump = new Audio('https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/jump.ogg');
const music = new Audio('https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/joyful_jungle.mp3');
const boom = new Audio('https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/boom.ogg');
jump.volume = 0.3;
music.volume = 0.8;

const images = {
    platformLarge: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/platform.png',
    platformSmall: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/platform_sml.png',
    bg: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/bg.png',
    grass: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/grass.png',
    standL1: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/standing_l.png',
    standR1: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/standing_r.png',
    runL1: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/run_l.png',
    runR1: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/run_r.png',
    standL2: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/standing_l2.png',
    standR2: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/standing_r2.png',
    runL2: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/run_l2.png',
    runR2: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/run_r2.png',
    bomb: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/bomb.png',
    intro: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/intro.png',
    outro: 'https://raw.githubusercontent.com/Swillycoder/ticktickboom/main/outro.png',
};

function loadImages(callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(images).length;

    for (const key in images) {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            images[key] = img;  // Replace URL with the loaded image object
            if (loadedImages === totalImages) {
                callback();
            }
        };
        img.src = images[key];
    }
}

const introDiv = document.getElementById('intro');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const startButton = document.getElementById('startGame');

// Hide the canvas initially
canvas.style.display = 'none';

const gravity = 1;

class Player {
    constructor(x, y, color, player, name, standL, standR, runL, runR, currentSprite) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.color = color;
        this.player = player;
        this.velocity = { x: 0, y: gravity };
        this.isJumping = false;
        this.speed = 5;
        this.name = name;
        this.tagged = null;
        this.isSwitching = false;
        this.frames = 0;
        this.standL = standL;
        this.standR = standR;
        this.runL = runL;
        this.runR = runR;

        this.frameDelay = 5;
        this.frameTimer = 0;
        this.currentSprite = currentSprite;
    }

    draw() {
        ctx.drawImage(
            this.currentSprite,
            this.width * this.frames,
            0,
            this.width,
            70,
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.textAlign = 'center';
        ctx.font = '20px Impact';
        ctx.fillStyle = 'white';
        ctx.fillText(this.name, this.x + this.width / 2, this.y - 5);

        if (this.tagged) {
            ctx.drawImage(images.bomb, this.x + 10, this.y + 40);
        }
    }

    boundaries() {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }

    platformCollision(platforms) {
        platforms.forEach((platform) => {
            if (
                this.y + this.height >= platform.y &&
                this.y <= platform.y + platform.height &&
                this.x + this.width >= platform.x &&
                this.x <= platform.x + platform.width
            ) {
                if (this.y + this.height - this.velocity.y <= platform.y) {
                    this.velocity.y = 0;
                    this.isJumping = false;
                    this.y = platform.y - this.height;
                }
            }
        });
    }

    update(platforms) {
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frames++;
            this.frameTimer = 0;
        }

        if (this.frames >= 5 && this.currentSprite === this.standR) {
            this.frames = 0;
        } else if (this.frames >= 5 && this.currentSprite === this.standL) {
            this.frames = 0;
        }
        if (this.frames >= 10 && this.currentSprite === this.runR) {
            this.frames = 0;
        } else if (this.frames >= 10 && this.currentSprite === this.runL) {
            this.frames = 0;
        }

        this.velocity.y += gravity;

        if (this.player === 'PLAYER1') {
            if (keys.KeyA) this.velocity.x = -this.speed;
            else if (keys.KeyD) this.velocity.x = this.speed;
            else this.velocity.x = 0;
        } else if (this.player === 'PLAYER2') {
            if (keys.ArrowLeft) this.velocity.x = -this.speed;
            else if (keys.ArrowRight) this.velocity.x = this.speed;
            else this.velocity.x = 0;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.tagged === true) {
            this.speed = 6;
        } else {
            this.speed = 5;
        }

        // Collision with ground
        const groundLevel = canvas.height - this.height - 50;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocity.y = 0;
            this.isJumping = false;
        }

        this.platformCollision(platforms);
        this.boundaries();
        this.draw();
    }
}

class Platforms {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y);
    }
}

const keys = {
    KeyW: false,
    KeyA: false,
    KeyD: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
    Enter: false,
    Space: false,
    KeyP: false,
    KeyN: false,
};

let player1, player2;
let platforms = [];

function initializeGame() {
    player1 = new Player(100, 400, 'red', 'PLAYER1', 'SAM', images.standL1, images.standR1, images.runL1, images.runR1, images.standR1);
    player2 = new Player(800, 400, 'blue', 'PLAYER2', 'AI', images.standL2, images.standR2, images.runL2, images.runR2, images.standL2);

    platforms = [
        // Large platforms
        new Platforms(100, 350, 150, 25, images.platformLarge),
        new Platforms(700, 350, 150, 25, images.platformLarge),
        new Platforms(250, 250, 150, 25, images.platformLarge),
        new Platforms(550, 250, 150, 25, images.platformLarge),
        new Platforms(100, 150, 150, 25, images.platformLarge),
        new Platforms(700, 150, 150, 25, images.platformLarge),
        new Platforms(canvas.width / 2 - 75, 100, 150, 25, images.platformLarge),
        // Small Platforms
        new Platforms(0, 250, 44, 25, images.platformSmall),
        new Platforms(916, 250, 44, 25, images.platformSmall),
        new Platforms(canvas.width / 2 - 15, 170, 44, 25, images.platformSmall),
        new Platforms(0, 100, 44, 25, images.platformSmall),
        new Platforms(916, 100, 44, 25, images.platformSmall),
    ];

    introScreen();
}

function introScreen() {
    assignInitialBomb(player1, player2);
    const name1 = player1NameInput.value || 'PLAYER 1';
    const name2 = player2NameInput.value || 'PLAYER 2';
    ctx.drawImage(images.intro, 0, 0);
    ctx.fillStyle = 'white';
    ctx.font = '30px Impact';
    ctx.textAlign = 'left';
    ctx.fillText('Hit SPACEBAR to begin', 60, 420);
    ctx.fillStyle = 'red';
    ctx.font = '60px Impact';
    ctx.textAlign = 'center';
    ctx.fillText(name1, canvas.width / 2, 130);
    ctx.fillText(name2, canvas.width / 2, 430);
}

function checkCollision(player1, player2) {
    return (
        player1.x < player2.x + player2.width &&
        player1.x + player1.width > player2.x &&
        player1.y < player2.y + player2.height &&
        player1.y + player1.height > player2.y
    );
}

function handleTagging() {
    if (player1.tagged && checkCollision(player1, player2) && !player1.isSwitching && !player2.isSwitching) {
        player1.tagged = false;
        player2.tagged = true;
        player1.isSwitching = true;
        setTimeout(() => {
            player1.isSwitching = false;
            console.log(`${player2.name} is now tagged!`);
        }, 1000);
    } else if (player2.tagged && checkCollision(player2, player1) && !player2.isSwitching && !player1.isSwitching) {
        player2.tagged = false;
        player1.tagged = true;
        player2.isSwitching = true;
        setTimeout(() => {
            player2.isSwitching = false;
            console.log(`${player1.name} is now tagged!`);
        }, 1000);
    }
}

function assignInitialBomb(player1, player2) {
    const randomChoice = Math.random() < 0.5;
    if (randomChoice) {
        player1.tagged = true;
        console.log(`${player1.name} starts with the bomb!`);
    } else {
        player2.tagged = true;
        console.log(`${player2.name} starts with the bomb!`);
    }
}

let countdownStart;
let countdownDuration = 3000;
let timeRemaining;

function startCountdown() {
    countdownStart = Date.now();
    timeRemaining = Math.ceil(countdownDuration / 1000);
}

function timer() {
    const now = Date.now();
    const elapsedTime = now - countdownStart;
    timeRemaining = Math.max(0, Math.ceil((countdownDuration - elapsedTime) / 1000));
    ctx.font = '50px Impact';
    ctx.fillStyle = 'white';
    ctx.fillText(`${timeRemaining}`, canvas.width / 2, 495);
}

function stopMusic() {
    music.pause();
    music.currentTime = 0;
}

function gameOverScreen() {
    gameOver = true;
    ctx.drawImage(images.outro, 0, 0);
    ctx.font = '50px Impact';
    ctx.fillStyle = 'black';
    if (player1.tagged === true) {
        ctx.fillText(player2.name, canvas.width / 2, 260);
    } else {
        ctx.fillText(player1.name, canvas.width / 2, 260);
    }

    ctx.fillText('WINS', canvas.width / 2, 320);

    ctx.font = '30px Impact';
    ctx.fillStyle = 'white';
    ctx.fillText('Hit P to Play again', canvas.width / 2, 380);
    ctx.fillText('Hit N for a New game', canvas.width / 2, 430);
}

function resetGame() {
    gameOver = false;
    player1.tagged = false;
    player2.tagged = false;
    assignInitialBomb(player1, player2);
    player1.x = 100;
    player1.y = 400;
    player1.velocity = { x: 0, y: gravity };
    player1.currentSprite = player1.standR;

    player2.x = 800;
    player2.y = 400;
    player2.velocity = { x: 0, y: gravity };
    player2.currentSprite = player2.standL;

    countdownStart = null;
    timeRemaining = Math.ceil(countdownDuration / 1000);
    countdownDuration = 60000;
    stopMusic();
}

let gameOver = true;

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        music.play();

        ctx.drawImage(images.bg, 0, 0);
        ctx.drawImage(images.grass, 0, canvas.height - 50);

        platforms.forEach((platform) => {
            platform.draw();
        });

        player1.update(platforms);
        player2.update(platforms);

        handleTagging();
        timer();

        if (timeRemaining <= 0) {
            boom.play();
            gameOver = true;
            gameOverScreen();
        }

        requestAnimationFrame(gameLoop);
    }
}

loadImages(() => {
    console.log("All images loaded!");
    initializeGame();
});

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    if (e.code === 'KeyW' && !player1.isJumping) {
        jump.play();
        player1.velocity.y -= 15;
        player1.isJumping = true;
    }
    if (e.code === 'KeyA' && gameOver === false) {
        player1.currentSprite = player1.runL;
    }
    if (e.code === 'KeyD' && !gameOver) {
        player1.currentSprite = player1.runR;
    }
    if (e.code === 'ArrowUp' && !player2.isJumping) {
        jump.play();
        player2.velocity.y = -15;
        player2.isJumping = true;
    }
    if (e.code === 'ArrowLeft' && !gameOver) {
        player2.currentSprite = player2.runL;
    }
    if (e.code === 'ArrowRight' && !gameOver) {
        player2.currentSprite = player2.runR;
    }
    if (e.code === 'Space' && gameOver) {
        gameOver = false;
        gameLoop();
        startCountdown();
    }
    if (e.code === 'KeyP' && gameOver) {
        resetGame();
        startCountdown();
        gameLoop();
    }
    if (e.code === 'KeyN' && gameOver) {
        location.reload();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
    if (e.code === 'KeyA' && gameOver === false) {
        player1.currentSprite = player1.standL;
    }
    if (e.code === 'KeyD') {
        player1.currentSprite = player1.standR;
    }
    if (e.code === 'ArrowLeft') {
        player2.currentSprite = player2.standL;
    }
    if (e.code === 'ArrowRight') {
        player2.currentSprite = player2.standR;
    }
});

startButton.addEventListener('click', () => {
    const name1 = player1NameInput.value || 'PLAYER 1';
    const name2 = player2NameInput.value || 'PLAYER 2';

    player1.name = name1;
    player2.name = name2;

    // Hide the intro screen and show the canvas
    introDiv.style.display = 'none';
    canvas.style.display = 'block';

    introScreen();
});
