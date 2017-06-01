cc.Class({
    extends: cc.Component,

    properties: {
        _arrow:null,
		_sprite:null,
        _pointer:null,
        _timeLabel:null,
        _time:-1,
        _alertTime:-1,
    },

    // use this for initialization
    onLoad: function() {
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow");
		this._sprite = this._arrow.getComponent("SpriteMgr");
		
//        this._pointer = this._arrow.getChildByName("pointer");
        this.initPointer();
        
//        this._timeLabel = this._arrow.getChildByName("lblTime").getComponent(cc.Label);
//        this._timeLabel.string = "00";
        
        var self = this;
        
        this.node.on('game_begin',function(data){
            self.initPointer();
        });

		this.node.on('game_sync',function(data){
            self.initPointer();
        });
		
        this.node.on('game_chupai',function(data){
            self.initPointer();
//            self._time = 10;
//            self._alertTime = 3;
        });
    }, 
    
    initPointer:function(){
        if(cc.vv == null){
            return;
        }
        this._arrow.active = cc.vv.gameNetMgr.gamestate == "playing" || cc.vv.replayMgr.isReplay();
        if (!this._arrow.active) {
            return;
        }
        var turn = cc.vv.gameNetMgr.turn;
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(turn);
/*
        for(var i = 0; i < this._pointer.children.length; ++i){
            this._pointer.children[i].active = i == localIndex;
        }
*/

		this._sprite.setIndex(localIndex);
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._time > 0){
            this._time -= dt;
            if(this._alertTime > 0 && this._time < this._alertTime){
                cc.vv.audioMgr.playSFX("timeup_alarm.mp3");
                this._alertTime = -1;
            }
            var pre = "";
            if(this._time < 0){
                this._time = 0;
            }
            
            var t = Math.ceil(this._time);
            if(t < 10){
                pre = "0";
            }
            this._timeLabel.string = pre + t; 
        }
    },
});
