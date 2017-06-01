
cc.Class({
    extends: cc.Component,

    properties: {
		_dice: null,
    },

    onLoad: function() {
		var gameChild = this.node.getChildByName('game');
		var dice = gameChild.getChildByName('dice');

		dice.active = false;
		this._dice = dice;

		var self = this;

		this.node.on('game_dice', function(data) {
            var dices = data.detail;

			self.play(dices[0], dices[1]);
        });
    },

    play: function(diceNum1, diceNum2) {
    	var dice = this._dice;
		var diceAnim = dice.getChildByName('diceAnim');
		var anim = diceAnim.getComponent(cc.Animation);
		var dice1 = dice.getChildByName('dice1');
		var dice2 = dice.getChildByName('dice2');

		diceAnim.active = true;
		dice1.getComponent('SpriteMgr').setIndex(diceNum1 - 1);
		dice2.getComponent('SpriteMgr').setIndex(diceNum2 - 1);
		dice1.active = false;		
		dice2.active = false;
        dice.active = true;

		var fn = function() {
			diceAnim.active = false;
			dice1.active = true;
			dice2.active = true;

			anim.off('finished', fn);

			setTimeout(function() {
				dice.active = false;
			}, 2000);
		};

		anim.on('finished', fn);

        var state = anim.play('dice2');
		cc.vv.audioMgr.playSFX('SoundCommon/DRAW_SICE0.mp3');
    },
});

