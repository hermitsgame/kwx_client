
cc.Class({
    extends: cc.Component,

    properties: {
        _nextPlayTime: 1,
        _replay: null,
        _isPlaying: true,

		_btnPlay: null,
		_btnPause: null,
		_over: null,
    },

    onLoad: function() {
        if (cc.vv == null) {
            return;
        }

        var replay = cc.find("Canvas/replay");
        replay.active = cc.vv.replayMgr.isReplay();

		this._btnPlay = replay.getChildByName('btn_play');
		this._btnPause = replay.getChildByName('btn_pause');

		this._over = replay.getChildByName('over');
		this._over.active = false;

		this._replay = replay;

		this.refreshBtn();
    },

	refreshBtn: function() {
		this._btnPlay.active = !this._isPlaying;
		this._btnPause.active = this._isPlaying;
    },

	replayOver: function(status) {
		var over = this._over;

        if (status) {
    		var position = cc.p(over.x, over.y);

	    	over.active = true;
	    	over.y += over.height;

		    over.runAction(cc.moveTo(0.6, position));
        } else {
            over.active = false;
        }
    },

    onBtnPauseClicked: function() {
		cc.vv.audioMgr.playButtonClicked();
	
        this._isPlaying = false;
		this.refreshBtn();
    },

    onBtnPlayClicked: function() {
		cc.vv.audioMgr.playButtonClicked();
        this._isPlaying = true;
		this.refreshBtn();
    },

    onBtnBackClicked: function() {
		cc.vv.audioMgr.playButtonClicked();
        cc.vv.replayMgr.clear();
        cc.vv.gameNetMgr.reset();
        cc.vv.gameNetMgr.roomId = null;
        cc.director.loadScene("hall");
    },

	onBtnPrevClicked: function() {
		var gameNetMgr = cc.vv.gameNetMgr;
		var old = this._isPlaying;

		cc.vv.audioMgr.playButtonClicked();

		this._isPlaying = false;

		cc.vv.replayMgr.prev(2);
		cc.vv.gameNetMgr.doSync();

		this._nextPlayTime = 2.0;
		this._isPlaying = old;

		this.refreshBtn();
		this.replayOver(false);
    },

	onBtnForwardClicked: function() {
		var old = this._isPlaying;

		cc.vv.audioMgr.playButtonClicked();
	
		this._isPlaying = false;

		cc.vv.replayMgr.forward(2);
		cc.vv.gameNetMgr.doSync();

		this._nextPlayTime = 2.0;
		this._isPlaying = old;

		this.refreshBtn();
    },

    // called every frame, uncomment this function to activate update callback
    update: function(dt) {
        if (cc.vv) {
            if (this._isPlaying && cc.vv.replayMgr.isReplay() && this._nextPlayTime > 0) {
                this._nextPlayTime -= dt;
                if (this._nextPlayTime < 0) {
					var next = cc.vv.replayMgr.takeAction();

					if (next < 0) {
						this.replayOver(true);
					}

                    this._nextPlayTime = next;
                }
            }
        }
    },
});

