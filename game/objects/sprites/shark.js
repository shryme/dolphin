
function Shark(game, group, x, y) {
	this.game = game;


	if (x === undefined && y === undefined) {
		x = 0;
		y = 0;
	}

	if (group !== undefined) {
		this.sprite = group.create(x, y, 'shark', 'm1.png');
	} else {
		this.sprite = this.game.add.sprite(x, y, 'shark', 'm1.png');
	}

	this.game.physics.arcade.enableBody(this.sprite);
	this.sprite.body.gravity.y = 0;
	this.sprite.body.collideWorldBounds = true;

	this.sprite.body.allowRotation = false;
	this.sprite.anchor.setTo(.5, .5);

	this.sprite.body.setSize(75, 50, 0, 0);


	var listMove = new Array();
	var listAttack = new Array();

	for (var i = 1; i <= 5; i++) {
		listMove.push('m' + i + '.png');
	}

	listAttack.push('a1.png');
	listAttack.push('a2.png');

	this.sprite.animations.add('move', listMove, 10, true, false);
	this.sprite.animations.add('idle', ['m1.png', 'm2.png'], 2, true, false);
	this.attackAnimation = this.sprite.animations.add('attack', listAttack, 5);
	this.sprite.animations.play('move');


	var fctAttackComplete = this.attackComplete.bind(this);
	this.attackAnimation.onComplete.add(fctAttackComplete);

	this.currentTarget;
	this.isAttacking = false;

	this.dmg = 1;

}

Shark.prototype = {
	create: function() {

	},
	update: function() {

		return true;

	},
	idle: function() {

		this.sprite.animations.play('idle');
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
	},
	attackComplete: function() {
		this.isAttacking = false;
		this.currentTarget.hurt(this.dmg);
	},
	attack: function(target) {
		this.currentTarget = target;
		this.isAttacking = true;
		this.sprite.animations.play('attack');
	},
	move: function(target, speed) {

		this.sprite.rotation = this.game.physics.arcade.moveToObject(this.sprite, target.sprite, speed);

		if (!this.isAttacking)
			this.sprite.animations.play('move');

		//Flip dolphin when moving to the left
		if (this.sprite.rotation < -1.5 || this.sprite.rotation > 1.5)
			this.sprite.scale.y = -1;
		else
			this.sprite.scale.y = 1;

	}
}

module.exports = Shark;








