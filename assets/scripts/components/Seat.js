cc.Class({
    extends: cc.Component,

    properties: {
        _sprIcon:null,
        _zhuang:null,
        _ready:null,
        _offline:null,
        _lblName:null,
        _lblScore:null,
        _voicemsg:null,
        _info: null,
        _sprBG: null,

		_lblWin: null,
		_lblLose: null,

        _chat:null,
        _emoji:null,
        _lastChatTime:-1,
        
        _userName: '',
        _score: 0,
        _isOffline:false,
        _isReady:false,
        _isZhuang:false,
        _piao: 0,
        _userId:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._sprIcon = this.node.getChildByName("icon").getComponent("ImageLoader");
        this._lblName = this.node.getChildByName("name").getComponent(cc.Label);
        this._lblScore = this.node.getChildByName("score").getComponent(cc.Label);
        this._voicemsg = this.node.getChildByName("voicemsg");
        this._info = this.node.getChildByName("info");

        var bg = this.node.getChildByName("bg");
        if (bg) {
            this._sprBG = bg.getComponent("SpriteMgr");
        }
        
        if (this._voicemsg) {
            this._voicemsg.active = false;
        }
        
        if(this._sprIcon && this._sprIcon.getComponent(cc.Button)){
            cc.vv.utils.addClickEvent(this._sprIcon,this.node,"Seat","onIconClicked");    
        }
        
        if (this._info) {
            this._info.active = false;
            
            var button = this._info.getComponent(cc.Button);
            if (button) {
                cc.vv.utils.addClickEvent(this._info, this.node, "Seat", "onInfoClicked");
            }
        }
        
        this._offline = this.node.getChildByName("offline");
        
        this._ready = this.node.getChildByName("ready");
        
        this._zhuang = this.node.getChildByName("zhuang");

        this._chat = this.node.getChildByName("chat");
        if (this._chat) {
            this._chat.active = false;
        }

		this._lblWin = this.node.getChildByName('lblWin');
		if (this._lblWin) {
			this._lblWin.active = false;
		}

		this._lblLose = this.node.getChildByName('lblLose');
		if (this._lblLose) {
			this._lblLose.active = false;
		}
/*
        this._emoji = this.node.getChildByName("emoji");
        if(this._emoji != null){
            this._emoji.active = false;
        }
*/        
        this.refresh();
        
        if(this._sprIcon && this._userId){
            this._sprIcon.setUserID(this._userId);
        }
    },
    
    onIconClicked:function(){
        var iconSprite = this._sprIcon.node.getComponent(cc.Sprite);
        if (this._userId != null && this._userId > 0) {
           var seat = cc.vv.gameNetMgr.getSeatByID(this._userId);
/*
            if (cc.vv.baseInfoMap) {
                var info = cc.vv.baseInfoMap[this._userId];
                if (info) {
                    sex = info.sex;
                }                
            }
*/
            var info = this._info;
            
            if (info) {
                var lblName = info.getChildByName("lblName").getComponent(cc.Label);
                var lblID = info.getChildByName("lblID").getComponent(cc.Label);
                var lblIP = info.getChildByName("lblIP").getComponent(cc.Label);

                lblName.string = seat.name;
                lblID.string = "" + seat.userid;
                lblIP.string = seat.ip.replace("::ffff:", "");
                
                info.active = true;
            }
            
            //cc.vv.userinfoShow.show(seat.name,seat.userid,iconSprite,sex,seat.ip);         
        }
    },
    
    onInfoClicked: function() {
        this._info.active = false;
    },
    
    refresh:function(){
        if(this._lblName != null){
            this._lblName.string = this._userName;    
        }
        
        if(this._lblScore != null){
			if (this._userName != '') {
	            this._lblScore.string = this._score;
			} else {
				this._lblScore.string = '';
			}
        }
        
        if(this._offline){
            this._offline.active = this._isOffline && this._userName != "";
        }
        
        if(this._ready){
            this._ready.active = this._isReady && (cc.vv.gameNetMgr.numOfGames > 0); 
        }
        
        if(this._zhuang){
            this._zhuang.active = this._isZhuang;    
        }
        
        if (this._sprBG) {
            if (!this._userId) {
                this._sprBG.setIndex(0);
            } else {
                this._sprBG.setIndex(1);
            }
        }
        
        //this.node.active = this._userName != null && this._userName != ""; 
    },
    
    setInfo: function(name, score) {
        this._userName = name;

		this.setScore(score);
        this.refresh();    
    },

	setScore: function(score) {
		if (score == null) {
            score = 0;
        }

        this._score = score;

        if (this._lblScore != null) {
            this._lblScore.node.active = this._score != null;
        }
    },

    setZhuang: function(value) {
        this._isZhuang = value;
        if(this._zhuang){
            this._zhuang.active = value;
        }
    },

    setPiao: function(value) {
        this._piao = value;
        
        var piao = this.node.getChildByName("piao");
        var spriteMgr = piao.getComponent("SpriteMgr");
        
        if (spriteMgr) {
            spriteMgr.setIndex(value);
        }
    },
    
    setReady:function(isReady){
        this._isReady = isReady;
        if(this._ready){
            this._ready.active = this._isReady && (cc.vv.gameNetMgr.numOfGames > 0); 
        }
    },
    
    setID:function(userid) {
        this._userId = userid;

        var id = this.node.getChildByName('id');

        if (id) {
            var label = id.getComponent(cc.Label);
            label.string = 'ID:' + userid;
        }

        if (this._sprIcon) {
            this._sprIcon.setUserID(userid); 
        }
    },
    
    setOffline:function(isOffline){
        this._isOffline = isOffline;
        if(this._offline){
            this._offline.active = this._isOffline && this._userName != "";
        }
    },
    
    chat: function(content) {
        var chat = this._chat;
        
        if (!chat) {
            return;
        }

        chat.active = true;

        var label = chat.getChildByName("label").getComponent(cc.Label);
        label.string = content;

        this._lastChatTime = 3;
    },
    
    emoji:function(emoji){
        //emoji = JSON.parse(emoji);
        if(this._emoji == null || this._emoji == null){
            return;
        }
        console.log(emoji);
        this._chatBubble.active = false;
        this._emoji.active = true;
        this._emoji.getComponent(cc.Animation).play(emoji);
        this._lastChatTime = 3;
    },
    
    voiceMsg:function(show){
        if(this._voicemsg){
            this._voicemsg.active = show;
        }
    },

	updateScore: function(score, add) {
		if (0 == add) {
			return;
		}

		var node = add > 0 ? this._lblWin : this._lblLose;

		if (!node) {
			return;
		}

		var label = node.getComponent(cc.Label);

		node.opacity = 255;
		node.active = true;

		if (add > 0) {
			label.string = ':' + add;
		} else {
			label.string = ':' + (0 - add);
		}

		var self = this;

		var fnUpdate = cc.callFunc(function(target, data) {
			data.active = false;
			self.setScore(score);
			self.refresh();
		}, this, node);

		var action = cc.sequence(cc.delayTime(0.3), cc.fadeTo(0.3, 0), fnUpdate);

		node.runAction(action);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._lastChatTime > 0) {
            this._lastChatTime -= dt;
            if (this._lastChatTime < 0) {
                this._chat.active = false;
            }
        }
    },
});

