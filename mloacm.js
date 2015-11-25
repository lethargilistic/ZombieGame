
// find and replace MLOACM with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function MLOACM(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Slumberite";
    this.color = "White";
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

MLOACM.prototype = new Entity();
MLOACM.prototype.constructor = MLOACM;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

//Returns c
var pythagoras = function(a, b)
{
	return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

var dot = function (v1, v2)
{
	var mag1 = pythagoras(v1.x, v1.y);
	var mag2 = pythagoras(v2.x, v2.y);
	var angleBetween = Math.atan(Math.abs(mag1.y - mag2.y), Math.abs(mag1.x - mag2.x));
	return mag1 * mag2 * Math.cos(angleBetween);
}

//Algorithm from here: http://www.blackpawn.com/texts/pointinpoly/
var pointInTriangle = function(point, triangleOrigin, sideLength, velocity, fovAngle)
{	
	//compute orientation of triangle
	var orientation = Math.atan(velocity.y/velocity.x);
	
	//compute side vectors
	fovAngle = fovAngle / 2;
	var sideB = {x:sideLength * Math.cos(orientation + fovAngle),
			y:sideLength * Math.sin(orientation + fovAngle)};
	var sideC = {x:sideLength * Math.cos(orientation - fovAngle),
			y:sideLength * Math.sin(orientation - fovAngle)};
	
	console.log(triangleOrigin, sideB, sideC);
	
	// Compute vectors
	var v0 = {x: sideC.x - triangleOrigin.x,
			y: sideC.y - triangleOrigin.y};
	var v1 = {x: sideB.x - triangleOrigin.x,
			y: sideB.y - triangleOrigin.y};
	var v2 = {x: point.x - triangleOrigin.x,
			y: point.y - triangleOrigin.y};

	// Compute dot products
	var dot00 = dot(v0, v0)
	var dot01 = dot(v0, v1)
	var dot02 = dot(v0, v2)
	var dot11 = dot(v1, v1)
	var dot12 = dot(v1, v2)

	// Compute barycentric coordinates
	var invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
	var u = (dot11 * dot02 - dot01 * dot12) * invDenom
	var v = (dot00 * dot12 - dot01 * dot02) * invDenom

	// Check if point is in triangle
	return (u >= 0) && (v >= 0) && (u + v < 1)
}

var leadRockThrow = function(human, zombie)
{
	//Figure out how fast rock moves
	var rockVector = {x: human.velocity.x * 2, y: human.velocity.y * 2};
	var rockVelocity = pythagoras(rockVector.x, rockVector.y)
	
	//calculate how long it will take for the rock to hit the zombie
	var distanceToZombie = pythagoras(human.x - zombie.x, human.y - zombie.y);
	var timeToZombie = distanceToZombie / rockVelocity;
	
	//estimate zombie's new position
	var zombieFuturePosition = {x:zombie.x + zombie.velocity.x * timeToZombie,
							y:zombie.y + zombie.velocity.y * timeToZombie};
	
	//console.log(zombie.x, zombie.y, zombieFuturePosition);
	
	return zombieFuturePosition;
}

MLOACM.prototype.selectAction = function () {

    var action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
    var acceleration = 1000000;
    var closest = 1000;
    var target = null;
    this.visualRadius = 500;
	this.shootingRange = 200
	this.fovAngle = 180;
	
	//look for zombies
    for (var i = 0; i < this.game.zombies.length; i++) {
        var ent = this.game.zombies[i];
        var dist = distance(ent, this);
        if (dist < closest) {
            closest = dist;
            target = ent;
        }
        if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            action.direction.x -= difX * acceleration / (dist * dist);
            action.direction.y -= difY * acceleration / (dist * dist);
        }
    }
	
	//look for rocks
    for (var i = 0; i < this.game.rocks.length; i++) {
        var ent = this.game.rocks[i];
		//function(point, triangleOrigin, sideLength, velocity, fovAngle)
        if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && pointInTriangle({x:ent.x, y:ent.y}, {x:this.x, y:this.y}, this.shootingRange, this.velocity, this.fovAngle)) {
		//&& this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                action.direction.x += difX * acceleration / (dist * dist);
                action.direction.y += difY * acceleration / (dist * dist);
            }
        }
    }

	//distance(this, target) < this.shootingRange
    if (target) {
        action.target = leadRockThrow(this, target);
        action.throwRock = true;
    }
    return action;
};

// do not change code beyond this point

MLOACM.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

MLOACM.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

MLOACM.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

MLOACM.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

MLOACM.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

MLOACM.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    //if (this.cooldown > 0) console.log(this.action);
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

MLOACM.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};
