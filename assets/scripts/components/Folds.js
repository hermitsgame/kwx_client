cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _folds: null,

		_lastMJ: null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }

        this.initView();
        this.initEventHandler();
        
        this.initAllFolds();
    },
    
    initView:function(){
        this._folds = {};
        var game = this.node.getChildByName("game");
        var sides = ["south","east","west"];
        for (var i = 0; i < sides.length; ++i) {
            var sideName = sides[i];
            var sideRoot = game.getChildByName(sideName);
            var folds = [];
            var foldRoot = sideRoot.getChildByName("folds");
            for (var j = 0; j < foldRoot.children.length; ++j) {
                var n = foldRoot.children[j];
                var mj = n.getComponent("Majiang");

                n.active = false;

                folds.push(mj);

				mj.oldx = n.x;
				mj.oldy = n.y;
            }

            this._folds[sideName] = folds; 
        }
        
        this.hideAllFolds();
    },
    
    hideAllFolds:function(){
        for (var k in this._folds) {
            var f = this._folds[k];
            for(var i in f){
                f[i].node.active = false;
            }
        }
    },
    
    initEventHandler:function(){
        var self = this;
        this.node.on('game_begin',function(data){
            self.initAllFolds();
        });  
        
        this.node.on('game_sync',function(data){
            self.initAllFolds();
        });
/*
        this.node.on('game_chupai_notify', function(data) {
			var sd = data.detail.seatData;
			var pai = data.detail.pai;

			var localIndex = cc.vv.gameNetMgr.getLocalIndex(sd.seatindex);
			if (0 == localIndex) {
				return;
			}
			
			if (self._lastMJ != null) {
				self._lastMJ.setFocus(false);
				self._lastMJ = null;
			}

			self.initFolds(sd, false, pai);
        });
*/        
        this.node.on('guo_notify',function(data) {
            //self.initFolds(data.detail, false, -1);
        });

		this.node.on('peng_notify', function(data) {
			self.initAllFolds();
			self._lastMJ = null;
		});

		this.node.on('gang_notify',function(data) {
			var info = data.detail;

			if (info.gangtype == 'diangang') {
				self.initAllFolds();
				self._lastMJ = null;
			}
		});

        this.node.on('refresh_mj',function() {
            self.initAllFolds(true);
        });
    },
    
    initAllFolds: function(refresh) {
        var seats = cc.vv.gameNetMgr.seats;
		var pai = cc.vv.gameNetMgr.chupai;
		
        for (var i in seats) {
			this.initFolds(seats[i], refresh);
        }
    },
    
    getRealIndex: function(idx) {
        if (idx < 8) {
            return idx + 16;
        } else if (idx >= 8 && idx < 16) {
            return idx;
        } else {
            return idx - 16;
        }
    },

	doChupai: function(seatData, pai, pos) {
		var folds = seatData.folds;
		var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var foldsSprites = this._folds[side];

		var start = folds.length;

		var index = this.getRealIndex(start);

		if (side == 'east') {
			index = foldsSprites.length - index - 1;
		}

		var mj = foldsSprites[index];
		var mjnode = mj.node;
		var self = this;
		var position = mjnode.parent.convertToNodeSpaceAR(pos);

		if (self._lastMJ != null) {
			self._lastMJ.setFocus(false);
			self._lastMJ = null;
		}

		mjnode.opacity = 0;
		mjnode.active = true;
		mj.setMJID(pai);
		var oldx = mj.oldx;
		var oldy = mj.oldy;

		var fnSetOpacity = cc.callFunc(function(target, data) {
			data.opacity = 255;
		}, this, mjnode);

		var fnFinished = cc.callFunc(function(target, data) {
			data.showFocus(true);
			data.node.x = data.oldx;
			data.node.y = data.oldy;
		}, this, mj);

		var actions = cc.sequence(cc.hide(),
									cc.place(position.x, position.y),
									cc.show(),
									fnSetOpacity,
									cc.moveTo(0.3, cc.p(oldx, oldy)),
									fnFinished);

		mjnode.runAction(actions);

		mj.setFocus(true);
		this._lastMJ = mj;
    },

    initFolds:function(seatData, refresh, chupai) {
        var folds = seatData.folds;
        if(folds == null){
            return;
        }
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var foldsSprites = this._folds[side];
        
        for (var i = 0; i < folds.length; ++i) {
            var index = this.getRealIndex(i);
            
            if (side == "east") {
                index = foldsSprites.length - index - 1;
            }

            var mj = foldsSprites[index];

            if (refresh) {
                mj.refresh();
            }

            mj.node.active = true;

            mj.setMJID(folds[i]);

			if (i == (folds.length - 1) && chupai == -1) {
				mj.setFocus(true);
				mj.showFocus();
				this._lastMJ = mj;
			} else {
				mj.setFocus(false);
			}
        }

		var start = folds.length;

		if (chupai != null && chupai >= 0) {
			var index = this.getRealIndex(start);
            
            if (side == "east") {
                index = foldsSprites.length - index - 1;
            }

            var mj = foldsSprites[index];

			if (refresh) {
                mj.refresh();
            }

            mj.node.active = true;
            mj.setMJID(chupai);
			mj.setFocus(true);
			mj.showFocus();

			start += 1;

			this._lastMJ = mj;
		}

        for (var i = start; i < foldsSprites.length; ++i) {
            var index = this.getRealIndex(i);
            if (side == "east") {
                index = foldsSprites.length - index - 1;
            }
            
            var mj = foldsSprites[index];
            
            mj.node.active = false;
        }  
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
