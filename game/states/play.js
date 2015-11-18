
'use strict';

var Player = require('../objects/entity/player');
var Friend = require('../objects/entity/friend');

function Play() {}
Play.prototype = {
	create: function() {

		this.game.physics.startSystem(Phaser.Physics.ARCADE);

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
		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);



		this.list = new Array();

		//Group of dolphins
		this.groupDolphins = this.game.add.group();


		//Us
		this.player = new Player(this.game, this.groupDolphins);

		var listObjectsDolphins = this.map.objects.dolphins;

		for (var i = 0; i < listObjectsDolphins.length;  i++) {
			var cur = listObjectsDolphins[i];
			var dolphin = new Friend(this.game, this.groupDolphins, cur.x, cur.y);

			this.list.push(dolphin);
		}

		//Add camera to follow our player
		this.game.camera.follow(this.player.entity.sprite);



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
			game.physics.arcade.collide(f.entity.sprite, blocks);
		});

		//Collide with friends
		this.game.physics.arcade.collide(this.groupDolphins);

		//Collide with blocks
		this.game.physics.arcade.collide(this.player.entity.sprite, this.blockLayer);

	},

	render: function() {

		this.game.debug.bodyInfo(this.player.entity.sprite, 32, 32);
		this.game.debug.body(this.player.entity.sprite);


		var game = this.game;
		this.list.forEach(function(f) {
			game.debug.body(f.entity.sprite);
		});

	}

};

module.exports = Play;







