

const utils = ({

    loadImages: (images) => new Promise((resolve, reject) => {
        let pending = 0,
            data = {},
            rejected = false;

        for (let key in images) {
            pending += 1;

            const img = new Image();
            img.src = images[key];
            img.onload = () => {
                pending -= 1;
                data[key] = img;

                if (pending === 0) {
                    resolve(data);
                }
            };
            img.onerror = (err) => {
                if (!rejected) {
                    rejected = true;
                    reject(err);
                }
            };
        }
    }),

    renderHitbox: false,
    hitboxColor: 'rgba(0, 255, 18, 0.5)',

    intersects: (posA, radiusA, posB, radiusB) => {
        let x = posB.x - posA.x,
            y = posB.y - posA.y;

        let distance = Math.sqrt(x*x + y*y);
        return distance < radiusA + radiusB;
    },

    keysDown: {},
    KEY_ARROW_UP: 38,
    KEY_ARROW_RIGHT: 39,
    KEY_ARROW_DOWN: 40,
    KEY_ARROW_LEFT: 37,
    KEY_SPACEBAR: 32,

});


document.addEventListener('keydown', event => {
    utils.keysDown[event.keyCode] = true;
}, false);

document.addEventListener('keyup', event => {
    utils.keysDown[event.keyCode] = false;
}, false);



class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get length(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set length(to){
        let length = this.length;
        this.x = (this.x / length) * to;
        this.y = (this.y / length) * to;
    }

    get angle(){ // to x-Axsis
        return Math.atan2(this.y, this.x) + Math.PI;
    }

    rotate(alpha){ // radians
        let sin = Math.sin(alpha),
            cos = Math.cos(alpha);
        let x = this.x * cos - this.y * sin,
            y = this.x * sin + this.y * cos;

        this.x = x;
        this.y = y;
    }
}
