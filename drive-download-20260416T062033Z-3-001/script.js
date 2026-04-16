const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

class Sprite {
    constructor({ position, velocity, color = 'red', offset }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.color = color;
        this.isAttacking = false;
        this.health = 100;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: offset,
            width: 100,
            height: 50
        };
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Attack box
        if (this.isAttacking) {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update() {
        this.draw();
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity;
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100); // Attack duration
    }
}

const player1 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: 0,
        y: 0
    }
});

const player2 = new Sprite({
    position: {
        x: canvas.width - 50,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'red',
    offset: {
        x: -50, // Offset to the left for player 2's attack
        y: 0
    }
});

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    }
};

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

let gameEnded = false; // Flag to control game state

function determineWinner({ player1, player2, timerId }) {
    clearTimeout(timerId);
    document.getElementById('displayText').style.display = 'flex';
    document.getElementById('restartButton').style.display = 'block'; // Show restart button
    gameEnded = true; // Set game ended flag
    if (player1.health === player2.health) {
        document.getElementById('displayText').innerHTML = 'Tie';
    } else if (player1.health > player2.health) {
        document.getElementById('displayText').innerHTML = 'Player 1 Wins';
    } else if (player2.health > player1.health) {
        document.getElementById('displayText').innerHTML = 'Player 2 Wins';
    }
}

let timer = 60;
let timerId;
function decreaseTimer() {
    if (timer > 0 && !gameEnded) { // Only decrease if game is not ended
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.getElementById('timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({ player1, player2, timerId });
    }
}

function resetGame() {
    clearTimeout(timerId); // Clear any running timer
    timer = 60;
    document.getElementById('timer').innerHTML = timer;
    document.getElementById('displayText').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    gameEnded = false;

    // Reset player states
    player1.health = 100;
    player1.position = { x: 0, y: 0 };
    player1.velocity = { x: 0, y: 0 };
    player1.isAttacking = false;
    document.getElementById('player1Health').style.width = '100%';

    player2.health = 100;
    player2.position = { x: canvas.width - 50, y: 0 };
    player2.velocity = { x: 0, y: 0 };
    player2.isAttacking = false;
    document.getElementById('player2Health').style.width = '100%';

    // Reset key presses
    for (const key in keys) {
        keys[key].pressed = false;
    }

    decreaseTimer(); // Start the timer again
    animate(); // Restart the animation loop if it was stopped
}

document.getElementById('restartButton').addEventListener('click', resetGame);

decreaseTimer();

function animate() {
    if (gameEnded) return; // Stop animation if game has ended

    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player1.update();
    player2.update();

    player1.velocity.x = 0;
    player2.velocity.x = 0;

    // Player 1 movement
    if (keys.a.pressed && player1.position.x > 0) {
        player1.velocity.x = -5;
    } else if (keys.d.pressed && player1.position.x + player1.width < canvas.width) {
        player1.velocity.x = 5;
    }

    // Player 2 movement
    if (keys.ArrowLeft.pressed && player2.position.x > 0) {
        player2.velocity.x = -5;
    } else if (keys.ArrowRight.pressed && player2.position.x + player2.width < canvas.width) {
        player2.velocity.x = 5;
    }

    // Detect for collision
    if (rectangularCollision({ rectangle1: player1, rectangle2: player2 }) && player1.isAttacking) {
        player1.isAttacking = false;
        player2.health -= 20;
        document.getElementById('player2Health').style.width = player2.health + '%';
    }

    if (rectangularCollision({ rectangle1: player2, rectangle2: player1 }) && player2.isAttacking) {
        player2.isAttacking = false;
        player1.health -= 20;
        document.getElementById('player1Health').style.width = player1.health + '%';
    }

    // End game based on health
    if (player1.health <= 0 || player2.health <= 0) {
        determineWinner({ player1, player2, timerId });
    }
}

animate();

window.addEventListener('keydown', (event) => {
    if (gameEnded) return; // Prevent input if game has ended

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'w':
            if (player1.velocity.y === 0) { // Only jump if on the ground
                player1.velocity.y = -15;
            }
            break;
        case ' ':
            player1.attack();
            break;

        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowUp':
            if (player2.velocity.y === 0) { // Only jump if on the ground
                player2.velocity.y = -15;
            }
            break;
        case 'Enter':
            player2.attack();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (gameEnded) return; // Prevent input if game has ended

    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'w':
            keys.w.pressed = false;
            break;

        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
    }
});

