const canvas = document.querySelector('#canvas');
const statusElement = document.querySelector('#status');
const WIDTH = canvas.width = canvas.offsetWidth;
const HEIGHT = canvas.height = canvas.offsetHeight;
const ctx = canvas.getContext('2d');
const fpsSpan = document.querySelector('#fps');
const scoreSpan = document.querySelector('#score');
ctx.imageSmoothingEnabled = false;

let imgs;
let hero, asteroids = [], spaceships = [], boss;
let score = 0, startTime;


const startGame = () => {
    statusElement.innerText = '';
    score = 0;
    updateScore();
    mainLoop.lastFrame = Date.now();

    window.requestAnimationFrame(mainLoop);
};


const updateScore = () => scoreSpan.innerText = `Score: ${score}`;


const gameOver = () => {
    mainLoop.paused = true;
    statusElement.innerText = `Game Over! (Score: ${ score })`;
    render();
};


const newAsteroid = () => {
    let imgName = 'asteroid' + (Math.floor(Math.random() * 3 + 1));
    let img = imgs[imgName];

    let asteroid = new Asteroid(img);
    asteroids.push(asteroid);
};


const render = () => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    let lasers = Object.values(hero.lasers);
    for (let laser of lasers) {
        laser.render(ctx);
    }

    asteroids.forEach(asteroid => asteroid.render(ctx));
    spaceships.forEach(spaceship => spaceship.render(ctx));
    boss.render(ctx);
    hero.render(ctx);
    Explosion.render(ctx);
};


const update = (delta) => {
    hero.update(delta);
    boss.update(delta);

    let lasers = Object.values(hero.lasers);
    for (let laser of lasers) {
        laser.update(delta);
        if (utils.intersects(laser.pos, laser.hitradius, boss.pos, boss.hitradius)) {
            laser.destroy();
            Explosion.create(boss.pos.x, boss.pos.y, 0.75);
            boss.reset();
            score += 20;
            updateScore();
        }
    }

    asteroids.forEach(asteroid => {
        asteroid.update(delta);

        if (utils.intersects(hero.pos, hero.hitradius, asteroid.pos, asteroid.hitradius))
            gameOver();


        for (let laser of lasers) {
            if (utils.intersects(laser.pos, laser.hitradius, asteroid.pos, asteroid.hitradius)) {
                laser.destroy();
                Explosion.create(laser.pos.x, laser.pos.y, 0.4, 20);
                score += 5;
                updateScore();
            }
        }
    });

    spaceships.forEach(spaceship => {
        spaceship.update(delta);

        if (utils.intersects(hero.pos, hero.hitradius, spaceship.pos, spaceship.hitradius))
            gameOver();


        for (let laser of lasers) {
            if (utils.intersects(laser.pos, laser.hitradius, spaceship.pos, spaceship.hitradius)) {
                laser.destroy();
                Explosion.create(laser.pos.x, laser.pos.y, 0.4, 20);
                spaceship.reset();
                score += 15;
                updateScore();
            }
        }
    });

    Explosion.update(delta);

    if (utils.intersects(hero.pos, hero.hitradius, boss.pos, boss.hitradius))
        gameOver();

};


const mainLoop = () => {
    window.requestAnimationFrame(mainLoop);
    if (mainLoop.paused)
        return;

    render();

    update(Date.now() - mainLoop.lastFrame);

    mainLoop.frames += 1;
    mainLoop.ticks += 1;
    mainLoop.lastFrame = Date.now();
};

mainLoop.paused = false;
mainLoop.lastFrame = Date.now();
mainLoop.frames = 0;
mainLoop.ticks = 0;

setInterval(() => {
    let fps = mainLoop.frames;

    fpsSpan.innerText = fps.toString();

    mainLoop.frames = 0;

    if (mainLoop.paused === false && mainLoop.ticks % 100 == 0) {
        newAsteroid();
        score += 10;
        updateScore();
    }
}, 1000);




utils.loadImages({
    hero: 'assets/hero.png',
    ship: 'assets/ship.png',
    asteroid1: 'assets/asteroid1.png',
    asteroid2: 'assets/asteroid2.png',
    asteroid3: 'assets/asteroid3.png',
    laser: 'assets/bullet.png',
    explode: 'assets/explode.png'
}).then((_imgs) => {
    imgs = _imgs;
    Explosion.image = imgs.explode;

    hero = new Hero(imgs.hero, imgs.laser);
    boss = new Boss(imgs.ship, hero);

    asteroids = [];
    for (let i = 0; i < 3; i++) {
        newAsteroid();
    }

    spaceships = [];
    for (let i = 0; i < 2; i++) {
        spaceships.push( new Spaceship(imgs.ship) );
    }


    statusElement.innerText = 'Press any key to start the Game!';
    window.addEventListener('keydown', function onKeydown(){
            window.removeEventListener('keydown', onKeydown);
            startGame();
    });
});
