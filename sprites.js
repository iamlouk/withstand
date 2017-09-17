
class Sprite {
    constructor(image) {
        this.image = image;
        this.pos = new Vector();
        this.velo = new Vector();
        this.width = image.width;
        this.height = image.height;
        this.rotation = 0; // radians
        this.hitradius = Math.min(this.width, this.height) / 2;
    }

    set scale(scale){
        this.width *= scale;
        this.height *= scale;
        this.hitradius = Math.min(this.width, this.height) / 2;
    }

    render(ctx){
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(
            this.image,
            -(this.width / 2),
            -(this.height / 2),
            this.width,
            this.height
        );

        if (utils.renderHitbox) {
            ctx.beginPath();
            ctx.arc(0, 0, this.hitradius, 0, 2 * Math.PI, false);
            ctx.fillStyle = utils.hitboxColor;
            ctx.fill();
        }

        ctx.restore();
    }

    update(delta){
        this.pos.x += this.velo.x * delta;
        this.pos.y += this.velo.y * delta;
    }
}


class Hero extends Sprite {
    constructor(image, laserImage) {
        super(image);
        this.pos.x = WIDTH / 3;
        this.pos.y = HEIGHT / 2;
        this.scale = 3;
        this.xSpeed = 0.2;
        this.ySpeed = 0.2;
        this.hitradius *= 0.9;

        this.laserImage = laserImage;
        this.lasers = {};
        this.laserIdCounter = 0;
        this.laserCooldown = 0;
    }

    update(delta){
        if (utils.keysDown[utils.KEY_ARROW_UP] === true && this.pos.y - (this.height / 2) > 0)
            this.pos.y -= this.ySpeed * delta;

        if (utils.keysDown[utils.KEY_ARROW_DOWN] === true && this.pos.y + (this.height / 2) < HEIGHT)
            this.pos.y += this.ySpeed * delta;

        if (utils.keysDown[utils.KEY_ARROW_LEFT] === true && this.pos.x - (this.width / 2) > 0)
            this.pos.x -= this.xSpeed * delta;

        if (utils.keysDown[utils.KEY_ARROW_RIGHT] === true && this.pos.x + (this.width / 2) < WIDTH)
            this.pos.x += this.xSpeed * delta;

        if (this.laserCooldown > 0) {
            this.laserCooldown -= 1;
        } else if (utils.keysDown[utils.KEY_SPACEBAR] === true) {
            this.piou();
            this.laserCooldown = 25;
        }
    }

    piou(){
        let id = this.laserIdCounter++;
        let laser = new Laser(this.laserImage, this, id);

        this.lasers[id] = laser;
    }

}


class Laser extends Sprite {
    constructor(image, hero, id) {
        super(image);
        this.hero = hero;
        this.id = id;
        this.scale = 1.5;
        this.pos.x = hero.pos.x;
        this.pos.y = hero.pos.y;
        this.velo = new Vector(0.75, 0);
        this.velo.rotate(hero.rotation);
    }

    update(delta){
        super.update(delta);
        if (this.pos.x < -this.width || this.pos.x > WIDTH + this.width || this.pos.y < -this.height || this.pos.y > HEIGHT + this.height) {
            this.destroy();
        }
    }

    destroy(){
        delete this.hero.lasers[this.id];
    }
}


class Asteroid extends Sprite {
    constructor(image) {
        super(image);
        this.scale = Math.floor(Math.random() * 3) + 1;
        this.velo.x = -(0.02 + Math.random() * 0.15);
        this.reset();
        this.hitradius *= 0.9;
        this.amplitude = 0.025 + Math.random() * 0.15;
        this.rotationSpeed = Math.random() * 0.1;
    }

    reset(){
        this.pos.x = WIDTH + this.width + (Math.random() * WIDTH);
        this.pos.y = (0.1 + Math.random() * 0.8) * HEIGHT;
    }

    update(delta){
        let sin = Math.sin(this.pos.x * 0.01) * this.amplitude;

        this.velo.y = sin;
        super.update(delta);
        this.rotation = (this.rotation + this.rotationSpeed) % (Math.PI * 4);

        if (this.pos.x < -this.width) {
            this.reset();
        }
    }

}

class Spaceship extends Sprite {
    constructor(image) {
        super(image);
        this.scale = 2;
        this.velo.x = -(0.075 + Math.random() * 0.2);
        this.reset();
        this.hitradius *= 0.5;
        this.amplitude = 0.025 + Math.random() * 0.15;
    }

    reset(){
        this.pos.x = WIDTH + this.width + (Math.random() * WIDTH);
        this.pos.y = (0.1 + Math.random() * 0.8) * HEIGHT;
    }

    update(delta){
        let sin = Math.sin(this.pos.x * 0.01) * this.amplitude;

        this.velo.y = sin;
        super.update(delta);
        this.rotation = this.velo.angle;

        if (this.pos.x < -this.width) {
            this.reset();
        }
    }

}


class Boss extends Sprite {
    constructor(image, hero){
        super(image);
        this.hero = hero;
        this.speed = 0.2;
        this.scale = 2;
        this.reset();
        this.hitradius = 20;
    }

    reset(){
        this.pos.x = WIDTH + this.width + (Math.random() * WIDTH);
        this.pos.y = (0.1 + Math.random() * 0.8) * HEIGHT;
    }

    update(delta){
        if (this.pos.x < -this.width) {
            this.reset();
            return;
        }

        let hero = this.hero;

        let vec = new Vector(hero.pos.x - this.pos.x, hero.pos.y - this.pos.y);
        if (vec.x >= 0) {
            let targetAngle = Math.PI * 2;
            let currentAngle = this.velo.angle;
            if (Math.abs(currentAngle - targetAngle) <= 0.1) {
                this.velo.x = -this.speed;
                this.velo.y = 0;
                this.rotation = 0;
                super.update(delta);
                return;
            }

            this.velo.rotate(currentAngle > targetAngle ? -0.05 : 0.05);
            this.rotation = this.velo.angle;
            super.update(delta);
            return;
        }

        vec.length = this.speed;
        this.velo = vec;
        this.rotation = this.velo.angle;
        super.update(delta);
    }
}


class Explosion {
    constructor(pos, scale, speed) {
        this.pos = pos;

        this.frame = 0;
        this.frames = 2048 / 128;

        this.sHeight = 128;
        this.sWidth = 128;

        this.height = this.sHeight * scale;
        this.width = this.sWidth * scale;

        this.msBetweenFrames = speed;
        this.delay = this.msBetweenFrames;
    }

    render(ctx){
        ctx.drawImage(
            Explosion.image,
            this.frame * this.sWidth,
            0,
            this.sWidth,
            this.sHeight,
            this.pos.x - (this.width / 2),
            this.pos.y - (this.height / 2),
            this.width,
            this.height
        );
    }

    update(delta, index){
        this.delay -= delta;
        if (this.delay <= 0) {
            this.frame += 1;
            this.delay = this.msBetweenFrames;

            if (this.frame >= this.frames) {
                Explosion.explosions.splice(index, 1);
            }
        }
    }

    static render(ctx){
        for (let expl of Explosion.explosions) {
            expl.render(ctx);
        }
    }

    static update(delta){
        let i = Explosion.explosions.length;
        while (i--) {
            Explosion.explosions[i].update(delta, i);
        }
    }

    static create(x, y, scale, speed = 50){
        let expl = new Explosion(new Vector(x, y), scale, speed);
        Explosion.explosions.push(expl);
    }
}

Explosion.explosions = [];
Explosion.image = null;
