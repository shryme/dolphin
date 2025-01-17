'use strict';

var Player = require('../objects/entity/player');
var Friend = require('../objects/entity/friend');
var Shark = require('../objects/entity/basicEnemy');
var Orca = require('../objects/entity/friendOrca');
var Turtle = require('../objects/entity/friendTurtle');
var GroupFish = require('../objects/entity/groupFish');


var Powerup = require('../objects/sprites/powerup');
var Rock = require('../objects/sprites/rock');

var Particles = require('../objects/particle/particles');

var NextLevel = require('../objects/sprites/nextLevel');

var Audio = require('../audio');



var tileIndex = {
	empty: -1,
	invisibleGravity: 900,
	visibleGravity: 866,
	waterwave: 871,
	waterfall_top: 845,
	waterfall: 875,
	waterCurrentUpLow: 885,
	waterCurrentUpMedium: 886,
	waterCurrentUpHigh: 887,
	waterCurrentDownLow: 888,
	waterCurrentDownMedium: 889,
	waterCurrentDownHigh: 890,
	waterCurrentLeftLow: 891,
	waterCurrentLeftMedium: 892,
	waterCurrentLeftHigh: 893,
	waterCurrentRightLow: 894,
	waterCurrentRightMedium: 895,
	waterCurrentRightHigh: 896,
}



/*******************************************************
Use to augment sprite, could be done better! */

//Add function to flip sprite when looking to the left
Phaser.Sprite.prototype.flipSprite = function() {
	if (this.rotation < -1.5 || this.rotation > 1.5)
		this.scale.y = -1;
	else
		this.scale.y = 1;
}

//Global initialize
Phaser.Sprite.prototype.initialize = function() {

}

/*
Sprite end!
*******************************************************/








function Play() {}
Play.prototype = {
	init: function(level) {
		console.log('init', level);
		this.currentLevel = level;
		this.isReady = false;
	},

	createAnimation: function(tile, animation, listAnim, speed, next) {
		var group = this.game.add.group();
		this.map.createFromTiles(tile, tileIndex.empty, animation, "background", group);

		group.forEach(
			function(tile){
				tile.animations.add('idle', listAnim, speed, true, false);
				tile.animations.play('idle');

				if (next !== undefined) {
					if (next.plan !== undefined && next.interval !== undefined) {
						var toTest;
						if (next.plan === 'x')
							toTest = this.blockLayer.getTileX(tile.x);
						else
							toTest = this.blockLayer.getTileY(tile.y);

						tile.animations.next(toTest % next.interval);
					}
				}

			}, this
		);
	},

	createObject: function(layer, constructor, group, list) {
		var listObjects = layer;

		for (var i = 0; i < listObjects.length;  i++) {
			var cur = listObjects[i];
			var obj = new constructor(this.game, cur.x, cur.y, this.listWaypoints[cur.properties.wp], cur.properties);
			if (obj.sprite !== undefined)
				group.add(obj.sprite);
			else
				group.add(obj);

			if (list !== undefined)
				list.push(obj);
		}

	},

	preload: function() {
		console.log('PRELOAD');
		this.background = this.game.add.sprite(0, 0, 'preloader_background');
		this.background.z = 9999;

		this.background.height = this.game.height;
		this.background.width = this.game.width;

		this.game.time.advancedTiming = true;

	},

	loadEverything: function() {
		console.log('create');

		//@exclude
		this.showDebug = true;
		//@endexclude

		this.game.physics.startSystem(Phaser.Physics.ARCADE);


		// background
		this.bg = this.game.add.sprite(0, 0, 'background');


		//Load tiles
		this.map = this.game.add.tilemap(this.currentLevel);
		this.map.addTilesetImage('basic', 'tileset');

		//Create block layer, and add collision
		this.map.createLayer('background');
		this.blockLayer = this.map.createLayer('block');
		this.blockLayer.resizeWorld();
		this.overlapLayer = this.map.createLayer('overlap');


		this.map.setCollisionBetween(0, 1000, true, this.blockLayer);
		this.map.setCollisionBetween(0, 1000, true, this.overlapLayer);


		var waterAnimation = ['water1.png', 'water2.png', 'water2.png'];
		this.createAnimation(tileIndex.waterwave, 'waterwave', waterAnimation, 5, {plan: 'x', interval: 3});

		var waterfallTopAnimation = ['waterfall_top1.png', 'waterfall_top2.png'];
		this.createAnimation(tileIndex.waterfall_top, 'waterfall', waterfallTopAnimation, 2);

		var waterfallAnimation = ['waterfall1.png', 'waterfall2.png', 'waterfall3.png', 'waterfall4.png'];
		this.createAnimation(tileIndex.waterfall, 'waterfall', waterfallAnimation, 10, {plan: 'x', interval: 3});


		//Set background size with the size if the tileset
		this.bg.height = this.map.widthInPixels;
		this.bg.width = this.map.heightInPixels;
		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);




		this.list = new Array();
		this.listEnemy = new Array();
		this.listWaypoints = {};

		//Group of dolphins
		this.groupDolphins = this.game.add.group();

		//Group of sharks
		this.groupSharks = this.game.add.group();

		//Group of orcas
		this.groupOrcas = this.game.add.group();

		//Group of turtles
		this.groupTurtles = this.game.add.group();

		//Group of powerups
		this.groupPowerups = this.game.add.group();

		//Group of level
		this.groupLevels = this.game.add.group();

		//Group of rocks
		this.groupRocks = this.game.add.group();




		this.particles = new Particles(this);
		this.game.customParticles = this.particles;

		var listObjectsOthers = this.map.objects.others;

		for (var i = 0; i < listObjectsOthers.length;  i++) {
			var cur = listObjectsOthers[i];

			if (cur.name === 'level') {
				var level = new NextLevel(this.game, cur.x, cur.y, cur.properties.level);
				this.groupLevels.add(level);
			}
			else if (cur.name === 'rock') {
				var rock = new Rock(this.game, cur.x, cur.y);
				this.groupRocks.add(rock);
			}
			else if (cur.name === 'music') {
				this.music = this.game.add.audio(cur.properties.song);
				this.music.play();
			}
			else if (cur.name === 'group_fish') {
				new GroupFish(this.game, cur, cur.properties);
			}

		}

		this.audio = new Audio(this.game);

		//Us
		var spawn = this.map.objects.spawn[0];
		this.player = new Player(this.game, spawn.x, spawn.y);
		this.groupDolphins.add(this.player.sprite);


		var listObjectsWaypoints = this.map.objects.waypoints;

		for (var i = 0; i < listObjectsWaypoints.length;  i++) {
			var cur = listObjectsWaypoints[i];
			var listWpUpdated = new Array();

			for (var j = 0; j < cur.polyline.length; j++) {

				var posWp = {
					x: cur.polyline[j][0] + cur.x,
					y: cur.polyline[j][1] + cur.y,
				}

				listWpUpdated.push(posWp);
			}

			this.listWaypoints[cur.name] = listWpUpdated;
		}


		this.createObject(this.map.objects.dolphins, Friend, this.groupDolphins, this.list);
		this.createObject(this.map.objects.sharks, Shark, this.groupSharks, this.listEnemy);
		this.createObject(this.map.objects.orcas, Orca, this.groupOrcas, this.list);
		this.createObject(this.map.objects.turtles, Turtle, this.groupTurtles, this.list);
		this.createObject(this.map.objects.powerups, Powerup, this.groupPowerups);


		//Add camera to follow our player
		this.game.camera.follow(this.player.sprite);

		//@exclude
		this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
		this.debugKey.onDown.add(this.toggleDebug, this);
		//@endexclude

		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.resetKey.onDown.add(this.resetGame, this);

		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.resetKey.onDown.add(this.resetGame, this);

		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		this.resetKey.onDown.add(this.goToLevelZero, this);

		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
		this.resetKey.onDown.add(this.goToLevelOne, this);

		//Mute
		this.muteMusicKey = this.game.input.keyboard.addKey(Phaser.Keyboard.O);
		this.muteMusicKey.onDown.add(this.muteMusic, this);

		//Unmute
		this.unmuteMusicKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
		this.unmuteMusicKey.onDown.add(this.unmuteMusic, this);

		this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
		this.pauseKey.onDown.add(this.togglePause, this);



		this.txtHp = this.game.add.text(10, 10, "Hp: 100", { font: "65px Arial", fill: "#bb00ff", align: "center"});
		this.txtHp.fixedToCamera = true;
		this.txtHp.cameraOffset.setTo(10, 10);

		for (var i = 0; i < this.overlapLayer.layer.data.length; i++)
			for (var j = 0; j < this.overlapLayer.layer.data[i].length; j++)
				if (this.overlapLayer.layer.data[i][j].index === tileIndex.invisibleGravity ||
					(this.overlapLayer.layer.data[i][j].index >= tileIndex.waterCurrentUpLow &&
					this.overlapLayer.layer.data[i][j].index <= tileIndex.waterCurrentRightHigh))
					this.overlapLayer.layer.data[i][j].alpha = 0;


		this.isReady = true;
		this.loadingSprite.kill();

		this.txtPaused = this.game.add.text(0, 0, 'PAUSE', { font: '137px Arial', fill: '#bb00ff' });

		this.txtPaused.anchor.setTo(0.5, 0.5);
		this.txtPaused.fixedToCamera = true;
		this.txtPaused.cameraOffset.setTo(this.game.width / 2, this.game.height / 2);
		this.txtPaused.visible = false;



		this.map.createLayer('foreground');


	},

	create: function() {
		var fctLoadEverything = this.loadEverything.bind(this);
		setTimeout(fctLoadEverything, 0);

		this.loadingSprite = this.add.sprite(this.game.width/2, this.game.height/2, 'dolphin');
		this.loadingSprite.anchor.setTo(0.5, 0.5);

		this.game.add.tween(this.loadingSprite).to( { angle: 360 }, 1000, Phaser.Easing.Linear.None, true, 0, -1);


	},

	update: function() {

		if (this.game.paused) {

			return;
		}

		if (!this.isReady)
			return;

		this.particles.update();

		//Get cursor
		var cursors = this.game.input.keyboard.createCursorKeys();

		//Update our player
		this.player.update(cursors);

		//Update all friends
		var game = this.game;
		var blocks = this.blockLayer;
		this.list.forEach(function(f) {
			f.update();
		});

		for (var i = this.listEnemy.length-1; i >= 0; i--) {
			if (this.listEnemy[i].sprite.alive === false)
				this.listEnemy.splice(i, 1);
			else
				this.listEnemy[i].update(this.player.sprite);
		}

		this.checkCollision();

		this.txtHp.text = "Hp: " + this.player.sprite.hp;

	},

	checkCollision: function() {


		//Collision between sharks and dolphins
		this.game.physics.arcade.collide(this.groupDolphins, this.groupSharks, undefined, this.dolphinProcessCallback, this);

		this.game.physics.arcade.collide(this.groupDolphins, this.groupOrcas);
		this.game.physics.arcade.collide(this.groupSharks, this.groupOrcas);
		this.game.physics.arcade.collide(this.groupTurtles, this.groupOrcas);

		this.game.physics.arcade.collide(this.groupDolphins, this.groupTurtles);
		this.game.physics.arcade.collide(this.groupSharks, this.groupTurtles);


		this.collisionGlobal(this.groupDolphins);
		this.collisionGlobal(this.groupSharks);
		this.collisionGlobal(this.groupOrcas);
		this.collisionGlobal(this.groupTurtles);


		//Detect powerup collision
		this.game.physics.arcade.overlap(this.groupPowerups, this.player.sprite, undefined, this.powerupCollision, this);

		//Detect level collision
		this.game.physics.arcade.overlap(this.groupLevels, this.player.sprite, undefined, this.levelCollision, this);

		//Detect rock collision
		this.game.physics.arcade.collide(this.groupRocks, this.player.sprite);
		this.game.physics.arcade.collide(this.groupRocks, this.blockLayer);
		this.game.physics.arcade.collide(this.groupRocks);





	},

	collisionGlobal: function(group) {

		//Collide with blocks
		this.game.physics.arcade.collide(group, this.blockLayer);

		//Collide with themself
		this.game.physics.arcade.collide(group);

		//Overlap for gravity
		this.game.physics.arcade.overlap(group, this.overlapLayer, undefined, this.addGravity, this);

	},

	render: function() {

		//@exclude
		this.game.debug.text('FPS: ' + this.game.time.fps, 795, 32, '#bb00ff');

		if (this.showDebug) {

			this.game.debug.bodyInfo(this.player.sprite, 32, 32);
			this.game.debug.body(this.player.sprite);


			var game = this.game;
			this.list.forEach(function(f) {
				game.debug.body(f.sprite);
			});
			this.listEnemy.forEach(function(f) {
				game.debug.body(f.sprite);
			});

		}
		//@endexclude


	},

	dolphinProcessCallback: function(dolphin, enemy) {
		return dolphin.processCallback(enemy);
	},

	//@exclude
	toggleDebug: function() {
		this.showDebug = !this.showDebug;

		if (!this.showDebug)
			this.game.debug.reset();
	},
	//@endexclude

	resetGame: function() {
		this.music.stop();
		this.game.state.start('play', true, false, this.currentLevel);
	},

	goToLevelZero: function() {
		this.music.stop();
		this.game.state.start('play', true, false, 'level0');
	},

	goToLevelOne: function() {
		this.music.stop();
		this.game.state.start('play', true, false, 'level1');
	},

	muteMusic: function() {
		this.music.volume = 0;
		this.game.customAudio.mute();
	},

	unmuteMusic: function() {
		this.music.volume = 1;
		this.game.customAudio.unmute();
	},

	togglePause: function() {
		this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
		this.game.paused = this.game.physics.arcade.isPaused;
		this.txtPaused.visible = this.game.paused;

	},

	addGravity: function(sprite, tile) {

		if (tile.index === tileIndex.invisibleGravity || tile.index === tileIndex.visibleGravity) {
			if(sprite.addGravity !== undefined)
				sprite.addGravity(this.blockLayer, this.overlapLayer, [tileIndex.visibleGravity, tileIndex.invisibleGravity]);
		}
		else if (tile.index === tileIndex.waterCurrentUpLow) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = -5000;
		}
		else if (tile.index === tileIndex.waterCurrentUpMedium) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = -10000;
		}
		else if (tile.index === tileIndex.waterCurrentUpHigh) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = -18000;
		}
		else if (tile.index === tileIndex.waterCurrentDownLow) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = 5000;
		}
		else if (tile.index === tileIndex.waterCurrentDownMedium) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = 10000;
		}
		else if (tile.index === tileIndex.waterCurrentDownHigh) {
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = 18000;
		}
		else if (tile.index === tileIndex.waterCurrentLeftLow) {
			sprite.body.gravity.x = -15000;
			sprite.body.gravity.y = 0;
		}
		else if (tile.index === tileIndex.waterCurrentLeftMedium) {
			sprite.body.gravity.x = -25000;
			sprite.body.gravity.y = 0;
		}
		else if (tile.index === tileIndex.waterCurrentLeftHigh) {
			sprite.body.gravity.x = -35000;
			sprite.body.gravity.y = 0;
		}
		else if (tile.index === tileIndex.waterCurrentRightLow) {
			sprite.body.gravity.x = 15000;
			sprite.body.gravity.y = 0;
		}
		else if (tile.index === tileIndex.waterCurrentRightMedium) {
			sprite.body.gravity.x = 25000;
			sprite.body.gravity.y = 0;
		}
		else if (tile.index === tileIndex.waterCurrentRightHigh) {
			sprite.body.gravity.x = 35000;
			sprite.body.gravity.y = 0;
		}
		else {
			if(sprite.removeGravity !== undefined)
				sprite.removeGravity();
			sprite.body.gravity.x = 0;
			sprite.body.gravity.y = 0;
		}


		return false;
	},

	powerupCollision: function(dolphin, powerup) {
		dolphin.items[powerup.powerupType] = true;
		powerup.destroy();
	},

	levelCollision: function(dolphin, level) {
		this.music.stop();
		this.game.state.start('play', true, false, level.next);
	}


};

module.exports = Play;




