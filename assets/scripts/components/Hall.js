
var Net = require("Net")
var Global = require("Global")

cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblGems:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        sprHeadImg:cc.Sprite,
    },
    
    initNetHandlers: function() {
        var self = this;
    },

	onShare: function() {
		var share = this.node.getChildByName('share');

		cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(share, 'body', true);
    },

	onShareClose: function() {
		var share = this.node.getChildByName('share');

		cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(share, 'body', false);
    },

    share: function(timeLine) {
		cc.vv.audioMgr.playButtonClicked();

		setTimeout(function() {
			cc.vv.anysdkMgr.share("全民卡五星","全民卡五星，包含了襄阳卡五星、随州卡五星等多种湖北流行卡五星麻将玩法。", timeLine);
		}, 100);
    },

    onShareWeChat: function() {
        this.share();
    },
    
    onShareTimeLine: function() {
        this.share(true);
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }

        if (!cc.vv) {
			console.log('load loading');
            cc.director.loadScene("loading");
            return;
        }

        this.initLabels();

        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);
        
        this.initButtonHandler("Canvas/top_right/btn_shezhi");
        this.initButtonHandler("Canvas/bottom_right/btn_help");
        this.initButtonHandler("Canvas/bottom_right/btn_zhanji");
        this.initButtonHandler("Canvas/bottom_right/btn_buy");

        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        this.lblNotice.string = cc.vv.userMgr.notice.msg;
        
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        
        //cc.vv.audioMgr.playBGM("bgMain.mp3");
        cc.vv.audioMgr.playBackGround();
    },
    
    start: function() {
        var roomId = cc.vv.userMgr.oldRoomId;
        if (roomId != null) {
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }

		var people = cc.find('Canvas/bottom_left/people');
		people.x = -598;
		people.runAction(cc.moveTo(0.5, cc.p(0, 0)));

		var btnCreate = cc.find('Canvas/btnCreateRoom');
		btnCreate.x += 600;
		btnCreate.runAction(cc.moveTo(0.5, cc.p(170, -100)));

		var btnJoin = cc.find('Canvas/btnJoinRoom');
		btnJoin.x += 600;
		btnJoin.runAction(cc.moveTo(0.5, cc.p(266, 84)));

		var logo = cc.find('Canvas/bottom_left/logo');
		logo.opacity = 0;
		logo.runAction(cc.fadeTo(0.8, 255));

		var br = cc.find('Canvas/bottom_right');
		br.opacity = 0;
		br.runAction(cc.fadeTo(0.8, 255));

		var tr = cc.find('Canvas/top_right');
		tr.opacity = 0;
		tr.runAction(cc.fadeTo(0.8, 255));

		var tl = cc.find('Canvas/top_left');
		tl.opacity = 0;
		tl.runAction(cc.fadeTo(0.8, 255));
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    
    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"fkgm",
            version:cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"notice",
            version:cc.vv.userMgr.notice.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler: function(btnPath) {
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    initLabels:function(){
        this.lblName.string = cc.vv.userMgr.userName;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },

	onSettingsClose: function() {
		cc.vv.utils.showDialog(this.settingsWin, 'body', false);
    },

    onBtnClicked: function(event) {
        cc.vv.audioMgr.playButtonClicked();

        if (event.target.name == "btn_shezhi") {
			cc.vv.utils.showDialog(this.settingsWin, 'body', true);
        }   
        else if (event.target.name == "btn_help") {
			cc.vv.utils.showFrame(this.helpWin, 'head', 'body', true);
        }
    },
    
    onJoinGameClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.joinGameWin, 'panel', true);
    },
    
    onReturnGameClicked:function() {
        cc.director.loadScene("mjgame");
    },
    
    onBtnAddGemsClicked:function() {
        cc.vv.audioMgr.playButtonClicked();

        cc.vv.alert.show(cc.vv.userMgr.gemstip.msg);
        this.refreshInfo();
    },
    
    onCreateRoomClicked:function(){
        cc.vv.audioMgr.playButtonClicked();
        
        if(cc.vv.gameNetMgr.roomId != null){
            cc.vv.alert.show("房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }

		cc.vv.utils.showDialog(this.createRoomWin, 'body', true);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
        
        if(cc.vv && cc.vv.userMgr.roomData != null){
            cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },
});
