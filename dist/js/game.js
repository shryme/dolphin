(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(900, 480, Phaser.AUTO, 'netmag-phaser');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":5,"./states/gameover":6,"./states/menu":7,"./states/play":8,"./states/preload":9}],2:[function(require,module,exports){

var Dolphin = require('../sprites/dolphin');


function Friend(game, group, x, y) {
	this.game = game;

	this.entity = new Dolphin(game, group, x, y);
	this.entity.create();

}

Friend.prototype = {
	create: function() {

	},
	update: function() {

		if (this.game.input.activePointer.isDown)
			this.entity.attack();
		else if (this.game.physics.arcade.distanceToXY(this.entity.sprite, 300, 300) > 100)
			this.entity.move(300, 300, 400);
		else
			this.entity.idle();

	}
}

module.exports = Friend;

},{"../sprites/dolphin":4}],3:[function(require,module,exports){

var Dolphin = require('../sprites/dolphin');


function Player(game, group) {
	this.game = game;

	this.entity = new Dolphin(game, group);
	this.entity.create();

}

Player.prototype = {
	create: function() {

	},
	update: function(cursors) {

		if (this.game.input.activePointer.isDown)
			this.entity.attack();
		else if (this.game.physics.arcade.distanceToPointer(this.entity.sprite, this.game.input.activePointer) > 20)
			this.entity.move();
		else
			this.entity.idle();


	}
}

module.exports = Player;

},{"../sprites/dolphin":4}],4:[function(require,module,exports){

function Dolphin(game, group, x, y) {
	this.game = game;

	// this.game.physics.startSystem(Phaser.Physics.ARCADE);


	if (x === undefined && y === undefined) {
		x = 0;
		y = 0;
	}

	if (group !== undefined) {
		this.sprite = group.create(x, y, 'dolphin', 'r1.png');
	} else {
		this.sprite = this.game.add.sprite(x, y, 'dolphin', 'r1.png');
	}


	this.game.physics.p2.enable(this.sprite);
	this.sprite.body.fixedRotation = true;
	this.sprite.body.collideWorldBounds = true;

	// this.sprite.body.setCircle(28);

	// this.game.physics.arcade.enable(this.sprite);

	// this.sprite.enableBody = true;
 //    this.sprite.physicsBodyType = Phaser.Physics.P2JS;

	// this.sprite.body.bounce.y = 0.8;
	// this.sprite.body.gravity.y = 0;
	// this.sprite.body.collideWorldBounds = true;

	// this.sprite.body.height = 54;
	// this.sprite.body.width = 224;

	// this.sprite.body.allowRotation = false;
	this.sprite.anchor.setTo(.5, .5);


	var list = new Array();
	var listXY = new Array();
	var listAttack = new Array();

	for (var i = 1; i <= 6; i++) {
		list.push('r' + i + '.png');
		listXY.push('xy' + i + '.png');
		listAttack.push('attack' + i + '.png');
	}


	listAttack.push('attack6.png');
	listAttack.push('attack6.png');
	listAttack.push('attack6.png');
	listAttack.push('attack6.png');
	listAttack.push('attack6.png');


	this.sprite.animations.add('moveX', list, 10, true, false);
	this.sprite.animations.add('moveXY', listXY, 10, true, false);
	this.sprite.animations.add('idle', ['r2.png', 'r3.png'], 2, true, false);
	this.attackAnimation = this.sprite.animations.add('attack', listAttack, 10);
	this.sprite.animations.play('moveX');

	this.isAttacking = false;
	this.isDangerous = false;

	this.attackAnimation.enableUpdate = true;

	var fctMoveForAttack = this.moveForAttack.bind(this);
	this.attackAnimation.onUpdate .add(function(current) {
		// console.log('test', a.currentFrame.index);
		if (current.currentFrame.index === 5)
			fctMoveForAttack();

	});


	var fctStopAttacking = this.stopAttack.bind(this);
	this.attackAnimation.onComplete.add(fctStopAttacking);

}

Dolphin.prototype = {
	create: function() {

	},
	idle: function() {
		if (this.isAttacking)
			return

		this.sprite.animations.play('idle');
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
	},
	moveForAttack: function() {
		this.sprite.body.velocity.x = this.vx * -1;
		this.sprite.body.velocity.y = this.vy * -1;

		this.isDangerous = true;


	},
	stopAttack: function() {
		this.isAttacking = false;
		this.isDangerous = false;
	},
	attack: function(x, y) {
		if (!this.isAttacking) {
			console.log('Attack');
			this.isAttacking = true;
			this.sprite.animations.play('attack');

			if (x === undefined && y === undefined) {
				// x = this.game.input.activePointer.clientX;
				// y = this.game.input.activePointer.clientY;

				x = this.game.input.worldX;
				y = this.game.input.worldY;
			}


			var dx = this.sprite.position.x - x;
			var dy = this.sprite.position.y - y;

			var factor = 450 / Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

			this.vx = dx * factor;
			this.vy = dy * factor;

			this.sprite.rotation = this.game.physics.arcade.angleToXY(this.sprite, x, y);

			//Flip dolphin when moving to the left
			if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
				this.sprite.scale.y = -1;
			else
				this.sprite.scale.y = 1;


		}
	},
	move: function(x, y, speed) {

		//If attacking, we stop moving update
		if (this.isAttacking) {

			//This is the build up before the attack
			if (!this.isDangerous) {
				this.sprite.body.velocity.x = 0;
				this.sprite.body.velocity.y = 0;
			}

			return
		}

		if (speed === undefined)
			speed = 300;

		if (x === undefined && y === undefined) {
			// this.sprite.rotation = this.game.physics.arcade.moveToPointer(this.sprite, speed, this.game.input.activePointer, 500);
			this.sprite.body.rotation = this.game.physics.arcade.moveToPointer(this.sprite, speed, this.game.input.activePointer, 500);
			this.sprite.rotation = this.sprite.body.rotation;
			// this.sprite.rotation = this.game.physics.arcade.moveToPointer(this.sprite, speed, this.game.input.activePointer, 500) - Math.PI/2
		}
		else {
			this.sprite.rotation = this.game.physics.arcade.moveToXY(this.sprite, x, y, speed);
			this.sprite.body.rotation = this.sprite.rotation;
		}



		this.sprite.animations.play('moveX');

		//Flip dolphin when moving to the left
		if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
			this.sprite.scale.y = -1;
		else
			this.sprite.scale.y = 1;

		this.sprite.body.data.updateAABB();

	}
}

module.exports = Dolphin;





// <script type="text/javascript">

// MonsterBunny = function (game, rotateSpeed) {

//     //  We call the Phaser.Sprite passing in the game reference
//     //  We're giving it a random X/Y position here, just for the sake of this demo - you could also pass the x/y in the constructor
//     Phaser.Sprite.call(this, game, game.world.randomX, game.world.randomY, 'bunny');

//     this.anchor.setTo(0.5, 0.5);

//     this.rotateSpeed = rotateSpeed;

//     var randomScale = 0.1 + Math.random();

//     this.scale.setTo(randomScale, randomScale)

//     game.add.existing(this);

// };

// MonsterBunny.prototype = Object.create(Phaser.Sprite.prototype);
// MonsterBunny.prototype.constructor = MonsterBunny;

// MonsterBunny.prototype.update = function() {

//     //  Automatically called by World.update
//     this.angle += this.rotateSpeed;

// };

// (function () {

//     var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create });

//     function preload() {

//         game.load.image('bunny', 'assets/sprites/bunny.png');

//     }

//     function create() {

//         for (var i = 0.1; i < 2; i += 0.1)
//         {
//             new MonsterBunny(game, i);
//         }

//     }

// })();
// </script>






















































































// function Dolphin(game, group, x, y) {
// 	this.game = game;

// 	// this.game.physics.startSystem(Phaser.Physics.ARCADE);


// 	if (x === undefined && y === undefined) {
// 		x = 0;
// 		y = 0;
// 	}

// 	if (group !== undefined) {
// 		this.sprite = group.create(x, y, 'dolphin', 'r1.png');
// 	} else {
// 		this.sprite = this.game.add.sprite(x, y, 'dolphin', 'r1.png');
// 	}
// 	// this.game.physics.arcade.enable(this.sprite);

// 	this.sprite.enableBody = true;
//     this.sprite.physicsBodyType = Phaser.Physics.P2JS;

// 	// this.sprite.body.bounce.y = 0.8;
// 	// this.sprite.body.gravity.y = 0;
// 	// this.sprite.body.collideWorldBounds = true;

// 	// this.sprite.body.height = 54;
// 	// this.sprite.body.width = 224;

// 	// this.sprite.body.allowRotation = false;
// 	this.sprite.anchor.setTo(.5, .5);


// 	var list = new Array();
// 	var listXY = new Array();
// 	var listAttack = new Array();

// 	for (var i = 1; i <= 6; i++) {
// 		list.push('r' + i + '.png');
// 		listXY.push('xy' + i + '.png');
// 		listAttack.push('attack' + i + '.png');
// 	}


// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');


// 	this.sprite.animations.add('moveX', list, 10, true, false);
// 	this.sprite.animations.add('moveXY', listXY, 10, true, false);
// 	this.sprite.animations.add('idle', ['r2.png', 'r3.png'], 2, true, false);
// 	this.attackAnimation = this.sprite.animations.add('attack', listAttack, 10);
// 	this.sprite.animations.play('moveX');

// 	this.isAttacking = false;
// 	this.isDangerous = false;

// 	this.attackAnimation.enableUpdate = true;

// 	var fctMoveForAttack = this.moveForAttack.bind(this);
// 	this.attackAnimation.onUpdate .add(function(current) {
// 		// console.log('test', a.currentFrame.index);
// 		if (current.currentFrame.index === 5)
// 			fctMoveForAttack();

// 	});


// 	var fctStopAttacking = this.stopAttack.bind(this);
// 	this.attackAnimation.onComplete.add(fctStopAttacking);

// }

// Dolphin.prototype = {
// 	create: function() {

// 	},
// 	idle: function() {
// 		if (this.isAttacking)
// 			return

// 		this.sprite.animations.play('idle');
// 		this.sprite.body.velocity.x = 0;
// 		this.sprite.body.velocity.y = 0;
// 	},
// 	moveForAttack: function() {
// 		this.sprite.body.velocity.x = this.vx * -1;
// 		this.sprite.body.velocity.y = this.vy * -1;

// 		this.isDangerous = true;


// 	},
// 	stopAttack: function() {
// 		this.isAttacking = false;
// 		this.isDangerous = false;
// 	},
// 	attack: function(x, y) {
// 		if (!this.isAttacking) {
// 			console.log('Attack');
// 			this.isAttacking = true;
// 			this.sprite.animations.play('attack');

// 			if (x === undefined && y === undefined) {
// 				// x = this.game.input.activePointer.clientX;
// 				// y = this.game.input.activePointer.clientY;

// 				x = this.game.input.worldX;
// 				y = this.game.input.worldY;
// 			}


// 			var dx = this.sprite.position.x - x;
// 			var dy = this.sprite.position.y - y;

// 			var factor = 450 / Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

// 			this.vx = dx * factor;
// 			this.vy = dy * factor;

// 			this.sprite.rotation = this.game.physics.arcade.angleToXY(this.sprite, x, y);

// 			//Flip dolphin when moving to the left
// 			if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
// 				this.sprite.scale.y = -1;
// 			else
// 				this.sprite.scale.y = 1;


// 		}
// 	},
// 	move: function(x, y, speed) {

// 		//If attacking, we stop moving update
// 		if (this.isAttacking) {

// 			//This is the build up before the attack
// 			if (!this.isDangerous) {
// 				this.sprite.body.velocity.x = 0;
// 				this.sprite.body.velocity.y = 0;
// 			}

// 			return
// 		}

// 		if (speed === undefined)
// 			speed = 300;

// 		if (x === undefined && y === undefined) {
// 			this.sprite.rotation = this.game.physics.arcade.moveToPointer(this.sprite, speed, this.game.input.activePointer, 500);
// 		}
// 		else
// 			this.sprite.rotation = this.game.physics.arcade.moveToXY(this.sprite, x, y, speed);



// 		this.sprite.animations.play('moveX');

// 		//Flip dolphin when moving to the left
// 		if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
// 			this.sprite.scale.y = -1;
// 		else
// 			this.sprite.scale.y = 1;

// 	}
// }

// module.exports = Dolphin;


























//arcade


// function Dolphin(game, group, x, y) {
// 	this.game = game;

// 	this.game.physics.startSystem(Phaser.Physics.ARCADE);


// 	if (x === undefined && y === undefined) {
// 		x = 0;
// 		y = 0;
// 	}

// 	if (group !== undefined) {
// 		this.sprite = group.create(x, y, 'dolphin', 'r1.png');
// 	} else {
// 		this.sprite = this.game.add.sprite(x, y, 'dolphin', 'r1.png');
// 	}
// 	this.game.physics.arcade.enable(this.sprite);

// 	this.sprite.body.bounce.y = 0.8;
// 	this.sprite.body.gravity.y = 0;
// 	this.sprite.body.collideWorldBounds = true;

// 	// this.sprite.body.height = 54;
// 	// this.sprite.body.width = 224;

// 	this.sprite.body.allowRotation = false;
// 	this.sprite.anchor.setTo(.5, .5);


// 	var list = new Array();
// 	var listXY = new Array();
// 	var listAttack = new Array();

// 	for (var i = 1; i <= 6; i++) {
// 		list.push('r' + i + '.png');
// 		listXY.push('xy' + i + '.png');
// 		listAttack.push('attack' + i + '.png');
// 	}


// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');
// 	listAttack.push('attack6.png');


// 	this.sprite.animations.add('moveX', list, 10, true, false);
// 	this.sprite.animations.add('moveXY', listXY, 10, true, false);
// 	this.sprite.animations.add('idle', ['r2.png', 'r3.png'], 2, true, false);
// 	this.attackAnimation = this.sprite.animations.add('attack', listAttack, 10);
// 	this.sprite.animations.play('moveX');

// 	this.isAttacking = false;
// 	this.isDangerous = false;

// 	this.attackAnimation.enableUpdate = true;

// 	var fctMoveForAttack = this.moveForAttack.bind(this);
// 	this.attackAnimation.onUpdate .add(function(current) {
// 		// console.log('test', a.currentFrame.index);
// 		if (current.currentFrame.index === 5)
// 			fctMoveForAttack();

// 	});


// 	var fctStopAttacking = this.stopAttack.bind(this);
// 	this.attackAnimation.onComplete.add(fctStopAttacking);

// }

// Dolphin.prototype = {
// 	create: function() {

// 	},
// 	idle: function() {
// 		if (this.isAttacking)
// 			return

// 		this.sprite.animations.play('idle');
// 		this.sprite.body.velocity.x = 0;
// 		this.sprite.body.velocity.y = 0;
// 	},
// 	moveForAttack: function() {
// 		this.sprite.body.velocity.x = this.vx * -1;
// 		this.sprite.body.velocity.y = this.vy * -1;

// 		this.isDangerous = true;


// 	},
// 	stopAttack: function() {
// 		this.isAttacking = false;
// 		this.isDangerous = false;
// 	},
// 	attack: function(x, y) {
// 		if (!this.isAttacking) {
// 			console.log('Attack');
// 			this.isAttacking = true;
// 			this.sprite.animations.play('attack');

// 			if (x === undefined && y === undefined) {
// 				// x = this.game.input.activePointer.clientX;
// 				// y = this.game.input.activePointer.clientY;

// 				x = this.game.input.worldX;
// 				y = this.game.input.worldY;
// 			}


// 			var dx = this.sprite.position.x - x;
// 			var dy = this.sprite.position.y - y;

// 			var factor = 450 / Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

// 			this.vx = dx * factor;
// 			this.vy = dy * factor;

// 			this.sprite.rotation = this.game.physics.arcade.angleToXY(this.sprite, x, y);

// 			//Flip dolphin when moving to the left
// 			if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
// 				this.sprite.scale.y = -1;
// 			else
// 				this.sprite.scale.y = 1;


// 		}
// 	},
// 	move: function(x, y, speed) {

// 		//If attacking, we stop moving update
// 		if (this.isAttacking) {

// 			//This is the build up before the attack
// 			if (!this.isDangerous) {
// 				this.sprite.body.velocity.x = 0;
// 				this.sprite.body.velocity.y = 0;
// 			}

// 			return
// 		}

// 		if (speed === undefined)
// 			speed = 300;

// 		if (x === undefined && y === undefined) {
// 			this.sprite.rotation = this.game.physics.arcade.moveToPointer(this.sprite, speed, this.game.input.activePointer, 500);
// 		}
// 		else
// 			this.sprite.rotation = this.game.physics.arcade.moveToXY(this.sprite, x, y, speed);



// 		this.sprite.animations.play('moveX');

// 		//Flip dolphin when moving to the left
// 		if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
// 			this.sprite.scale.y = -1;
// 		else
// 			this.sprite.scale.y = 1;

// 	}
// }

// module.exports = Dolphin;

},{}],5:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],6:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    this.gameoverbg = this.game.add.sprite(0, 0, 'gameover');
    this.score_text = this.game.add.text(this.game.world.centerX, 325, this.game.score, { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.score_text.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],7:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
	preload: function() {

	},
	create: function() {
		this.background = this.game.add.sprite(0, 0, 'menu');

		this.background.height = this.game.height;
		this.background.width = this.game.width;

		var button = this.game.add.button(this.game.world.centerX - 95, 200, 'creature_1', play, this, 2, 1, 0);
		var button = this.game.add.button(this.game.world.centerX - 95, 300, 'creature_2', showMaze, this, 2, 1, 0);
		var button = this.game.add.button(this.game.world.centerX - 95, 400, 'creature_3', generateMaze, this, 2, 1, 0);

    function play() {
    	this.game.state.start('play');
    }

    function showMaze() {
    	this.game.state.start('maze', true, false, true);
    }

    function generateMaze() {
    	this.game.state.start('maze', true, false, false);
    }

	},
	update: function() {
		if(this.game.input.activePointer.justPressed()) {
			// this.game.state.start('maze');
		}
	}
};

module.exports = Menu;

},{}],8:[function(require,module,exports){

'use strict';

var Player = require('../objects/entity/player');
var Friend = require('../objects/entity/friend');

function Play() {}
Play.prototype = {
	create: function() {

		this.game.physics.startSystem(Phaser.Physics.P2JS);

    	// this.game.physics.p2.updateBoundsCollisionGroup();

		// background
		this.bg = this.game.add.sprite(0, 0, 'background');


		//Load tiles
		this.map = this.game.add.tilemap('tilemap');
		this.map.addTilesetImage('basic', 'tileset');

		//Create block layer, and add collision
		this.blockLayer = this.map.createLayer('block');
		this.blockLayer.resizeWorld();
		this.map.setCollisionBetween(0, 5);


		//Set background size with the size if the tileset
		this.bg.height = this.map.widthInPixels;
		this.bg.width = this.map.heightInPixels;
		// this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);




		this.game.physics.p2.convertTilemap(this.map, this.blockLayer);


		this.game.physics.p2.setImpactEvents(true);

		this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.dolphinsCollisionGroup = this.game.physics.p2.createCollisionGroup();







		this.list = new Array();

		//Group of friends, this contains only sprite
		this.groupFriends = this.game.add.group();

		this.groupDolphins = this.game.add.group();

		this.groupDolphins.enableBody = true;
		this.groupDolphins.physicsBodyType = Phaser.Physics.P2JS;
		// this.groupDolphins.setAll('body.fixedRotation', true);


		// this.groupObjectsTile = this.game.add.group();

		// this.groupAll = this.game.add.group();


		//Us
		this.player = new Player(this.game, this.groupDolphins);
		// this.player.entity.sprite.body.setCollisionGroup(this.playerCollisionGroup);
		// this.player.entity.sprite.body.collides(this.dolphinsCollisionGroup);


		var listObjectsDolphins = this.map.objects.dolphins;

		for (var i = 0; i < listObjectsDolphins.length;  i++) {
			var cur = listObjectsDolphins[i];
			var dolphin = new Friend(this.game, this.groupDolphins, cur.x, cur.y);
			// dolphin.entity.sprite.body.setCollisionGroup(this.dolphinsCollisionGroup);
			// dolphin.entity.sprite.body.collides([this.dolphinsCollisionGroup, this.playerCollisionGroup]);
			this.list.push(dolphin);
		}

		//Add camera to follow our player
		this.game.camera.follow(this.player.entity.sprite);

		this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		// panda.body.setCollisionGroup(pandaCollisionGroup);

  //       //  Pandas will collide against themselves and the player
  //       //  If you don't set this they'll not collide with anything.
  //       //  The first parameter is either an array or a single collision group.
  //       panda.body.collides([pandaCollisionGroup, playerCollisionGroup]);


	},

	update: function() {

		//Get cursor
		var cursors = this.game.input.keyboard.createCursorKeys();

		//Update our player
		this.player.update(cursors);

		//Update all friends
		var game = this.game;
		var blocks = this.blockLayer;
		this.list.forEach(function(f) {
			f.update();
			// game.physics.arcade.collide(f.entity.sprite, blocks);
		});

		//Collide with friends
		// this.game.physics.arcade.collide(this.groupDolphins);

		//Collide with blocks
		// this.game.physics.arcade.collide(this.player.entity.sprite, this.blockLayer);

	},

	render: function() {
		this.game.debug.cameraInfo(this.game.camera, 32, 32);

		this.game.debug.body(this.player.entity.sprite);

		// this.player.entity.sprite.body.debugBody.draw();
	}

};

module.exports = Play;























// 'use strict';

// var Player = require('../objects/entity/player');
// var Friend = require('../objects/entity/friend');

// function Play() {}
// Play.prototype = {
// 	create: function() {

// 		this.game.physics.startSystem(Phaser.Physics.P2JS);

// 		this.game.physics.p2.setImpactEvents(true);

// 		this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
//     	this.dolphinsCollisionGroup = this.game.physics.p2.createCollisionGroup();

//     	this.game.physics.p2.updateBoundsCollisionGroup();

// 		// background
// 		this.bg = this.game.add.sprite(0, 0, 'background');


// 		//Load tiles
// 		this.map = this.game.add.tilemap('tilemap');
// 		this.map.addTilesetImage('basic', 'tileset');


// 		//Set background size with the size if the tileset
// 		this.bg.height = this.map.widthInPixels;
// 		this.bg.width = this.map.heightInPixels;
// 		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);


// 		//Create block layer, and add collision
// 		this.blockLayer = this.map.createLayer('block');
// 		this.map.setCollisionBetween(0, 5);




// 		this.list = new Array();

// 		//Group of friends, this contains only sprite
// 		this.groupFriends = this.game.add.group();

// 		this.groupDolphins = this.game.add.group();

// 		// this.groupObjectsTile = this.game.add.group();

// 		// this.groupAll = this.game.add.group();


// 		//Us
// 		this.player = new Player(this.game, this.groupDolphins);
// 		this.player.entity.sprite.body.setCollisionGroup(playerCollisionGroup);
// 		this.player.entity.sprite.body.collides(dolphinsCollisionGroup);


// 		var listObjectsDolphins = this.map.objects.dolphins;

// 		for (var i = 0; i < listObjectsDolphins.length;  i++) {
// 			var cur = listObjectsDolphins[i];
// 			var dolphin = new Friend(this.game, this.groupDolphins, cur.x, cur.y);
// 			dolphin.entity.sprite.body.setCollisionGroup(dolphinsCollisionGroup);
// 			dolphin.entity.sprite.body.collides([dolphinsCollisionGroup, playerCollisionGroup]);
// 			this.list.push(dolphin);
// 		}

// 		//Add camera to follow our player
// 		this.game.camera.follow(this.player.entity.sprite);


// 		// panda.body.setCollisionGroup(pandaCollisionGroup);

//   //       //  Pandas will collide against themselves and the player
//   //       //  If you don't set this they'll not collide with anything.
//   //       //  The first parameter is either an array or a single collision group.
//   //       panda.body.collides([pandaCollisionGroup, playerCollisionGroup]);


// 	},

// 	update: function() {

// 		//Get cursor
// 		var cursors = this.game.input.keyboard.createCursorKeys();

// 		//Update our player
// 		this.player.update(cursors);

// 		//Update all friends
// 		var game = this.game;
// 		var blocks = this.blockLayer;
// 		this.list.forEach(function(f) {
// 			f.update();
// 			game.physics.arcade.collide(f.entity.sprite, blocks);
// 		});

// 		//Collide with friends
// 		this.game.physics.arcade.collide(this.groupDolphins);

// 		//Collide with blocks
// 		this.game.physics.arcade.collide(this.player.entity.sprite, this.blockLayer);

// 	},

// 	render: function() {
// 		this.game.debug.cameraInfo(this.game.camera, 32, 32);
// 	}

// };

// module.exports = Play;











































//arcade


// 'use strict';

// var Player = require('../objects/entity/player');
// var Friend = require('../objects/entity/friend');

// function Play() {}
// Play.prototype = {
// 	create: function() {

// 		// background
// 		this.bg = this.game.add.sprite(0, 0, 'background');


// 		//Load tiles
// 		this.map = this.game.add.tilemap('tilemap');
// 		this.map.addTilesetImage('basic', 'tileset');


// 		//Set background size with the size if the tileset
// 		this.bg.height = this.map.widthInPixels;
// 		this.bg.width = this.map.heightInPixels;
// 		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);


// 		//Create block layer, and add collision
// 		this.blockLayer = this.map.createLayer('block');
// 		this.map.setCollisionBetween(0, 5);




// 		this.list = new Array();

// 		//Group of friends, this contains only sprite
// 		this.groupFriends = this.game.add.group();

// 		this.groupDolphins = this.game.add.group();

// 		// this.groupObjectsTile = this.game.add.group();

// 		// this.groupAll = this.game.add.group();


// 		//Us
// 		this.player = new Player(this.game, this.groupDolphins);



// 		var listObjectsDolphins = this.map.objects.dolphins;

// 		for (var i = 0; i < listObjectsDolphins.length;  i++) {
// 			var cur = listObjectsDolphins[i];
// 			var dolphin = new Friend(this.game, this.groupDolphins, cur.x, cur.y);
// 			this.list.push(dolphin);
// 		}

// 		//Add camera to follow our player
// 		this.game.camera.follow(this.player.entity.sprite);



// 	},

// 	update: function() {

// 		//Get cursor
// 		var cursors = this.game.input.keyboard.createCursorKeys();

// 		//Update our player
// 		this.player.update(cursors);

// 		//Update all friends
// 		var game = this.game;
// 		var blocks = this.blockLayer;
// 		this.list.forEach(function(f) {
// 			f.update();
// 			game.physics.arcade.collide(f.entity.sprite, blocks);
// 		});

// 		//Collide with friends
// 		this.game.physics.arcade.collide(this.groupDolphins);

// 		//Collide with blocks
// 		this.game.physics.arcade.collide(this.player.entity.sprite, this.blockLayer);

// 	},

// 	render: function() {
// 		this.game.debug.cameraInfo(this.game.camera, 32, 32);
// 	}

// };

// module.exports = Play;


},{"../objects/entity/friend":2,"../objects/entity/player":3}],9:[function(require,module,exports){

'use strict';
function Preload() {
	this.asset = null;
	this.ready = false;
}

Preload.prototype = {
	preload: function() {
		this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
		this.asset.anchor.setTo(0.5, 0.5);

		this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.setPreloadSprite(this.asset);
		this.load.image('yeoman', 'assets/player.png');

		this.load.image('menu', 'assets/background.png');
		this.load.image('background', 'assets/background.png');
		this.load.image('player', 'assets/player.png');
		this.load.image('creature_1', 'assets/creature_1.png');
		this.load.image('creature_2', 'assets/creature_2.png');
		this.load.image('creature_3', 'assets/creature_3.png');
		this.load.image('gameover', 'assets/background.png');

		this.load.tilemap('tilemap', 'assets/tilemaps/level0.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tileset', "assets/tilemaps/tileset.png");

		//this.load.spritesheet('dolphin', 'assets/sprites.png', 164, 72);

		this.load.atlasJSONHash('dolphin', 'assets/sprites/dolphin.png', 'assets/sprites/dolphin.json');


	},
	create: function() {
		this.asset.cropEnabled = false;
	},
	update: function() {
		if(!!this.ready) {
			this.game.state.start('menu');
		}
	},
	onLoadComplete: function() {
		this.ready = true;
	}
};

module.exports = Preload;

},{}]},{},[1])