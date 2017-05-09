cc.Class({
    extends: cc.Component,

    properties: {
        _popuproot:null,
        _dissolveNotice:null,
        
        _menu: null,
        _audioSet: null,
        _skinSet: null,
        
        _endTime:-1,
        _lastSeconds: 0,
        _extraInfo:null,
        _noticeLabel:null,
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        
        cc.vv.popupMgr = this;
        
        var root = cc.find("Canvas/popups");

        this._popuproot = root;

        var dissolveNotice = cc.find("Canvas/popups/dissolve_notice");
		this._noticeLabel = cc.find('body/info', dissolveNotice).getComponent(cc.Label);

        this._dissolveNotice = dissolveNotice;
		dissolveNotice.active = false;

        this._menu = root.getChildByName('menu');
        this._audioSet = root.getChildByName('audioSet');
        this._skinSet = root.getChildByName('skinSet');

        this.closeAll();

		root.active = false;

        this.addBtnHandler("dissolve_notice/body/btn_agree");
        this.addBtnHandler("dissolve_notice/body/btn_reject");
        this.addBtnHandler("dissolve_notice/body/btn_dissolve");

        this.addBtnHandler('menu/btnAudio');
        this.addBtnHandler('menu/btnSkin');
        this.addBtnHandler('menu/btnDissolve');

        var self = this;
        this.node.on("dissolve_notice", function(event) {
            var data = event.detail;
            self.showDissolveNotice(data);
        });

		this.node.on('dissolve_done', function(event) {
			self._endTime = -1;
			cc.vv.utils.showDialog(self._dissolveNotice, 'body', false, self._popuproot);
		});

        this.node.on("dissolve_cancel", function(event) {
            self._endTime = -1;
            cc.vv.utils.showDialog(self._dissolveNotice, 'body', false, self._popuproot);

            var data = event.detail;
            var userid = data.reject;

            if (userid != null && userid != cc.vv.userMgr.userId) {
                var seat = cc.vv.gameNetMgr.getSeatByID(userid);
                if (seat) {
                    cc.vv.alert.show('玩家' + seat.name + '已拒绝解散请求', function() {}, false);
                }
            }
        });
    },
    
    start:function() {
        if(cc.vv.gameNetMgr.dissoveData){
            this.showDissolveNotice(cc.vv.gameNetMgr.dissoveData);
        }
    },
    
    addBtnHandler:function(btnName){
        var btn = cc.find('Canvas/popups/' + btnName);
        this.addClickEvent(btn, this.node, 'PopupMgr', 'onBtnClicked');
    },
    
    addClickEvent:function(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    onBtnClicked:function(event) {
        this.closeAll();
        var btnName = event.target.name;
        if(btnName == "btn_agree"){
            cc.vv.net.send("dissolve_agree");
        }
        else if(btnName == "btn_reject"){
            cc.vv.net.send("dissolve_reject");
        }
        else if(btnName == "btn_sqjsfj"){
            cc.vv.net.send("dissolve_request"); 
        } else if (btnName == "btnAudio") {
            this.showAudioSet();
        } else if (btnName == "btnSkin") {
            this.showSkinSet();
        } else if (btnName == "btnDissolve") {
            var isIdle = cc.vv.gameNetMgr.numOfGames == 0;
            var isOwner = cc.vv.gameNetMgr.isOwner();
            
            if (isIdle) {
                if (isOwner) {
                    cc.vv.alert.show('牌局还未开始，房主解散房间，房卡退还', function() {
                        cc.vv.net.send("dispress");
                    }, true);
                } else {
                    cc.vv.net.send("exit");
                }
            } else {
                cc.vv.net.send("dissolve_request");
            }
        } else if (btnName == "btn_dissolve") {
            cc.vv.net.send("dissolve_request");
        }
    },
    
    closeAll: function() {
		//this._popuproot.active = false;

        this._audioSet.active = false;
        this._skinSet.active = false;
		this._menu.active = false;
    },
    
    showMenu: function() {
        var show = this._popuproot.active && this._menu.active;

        this.closeAll();
        
        if (!show) {
            this._popuproot.active = true;
            this._menu.active = true;

			var isReplay = cc.vv.replayMgr.isReplay();
			var btnDissolve = cc.find('Canvas/popups/menu/btnDissolve');
			btnDissolve.getComponent(cc.Button).interactable = !isReplay;
        }
    },
    
    showAudioSet: function() {
        this.closeAll();
        this._popuproot.active = true;

		cc.vv.utils.showDialog(this._audioSet, 'body', true);
    },
    
    showSkinSet: function() {
        this.closeAll();
        this._popuproot.active = true;

		cc.vv.utils.showDialog(this._skinSet, 'body', true);
    },
    
    showDissolveRequest: function() {
        this.closeAll();
        this._popuproot.active = true;
    },
	
    showDissolveNotice: function(data) {
        this._endTime = Date.now()/1000 + data.time;
        var dissolveNotice = this._dissolveNotice;
		var body = dissolveNotice.getChildByName('body');

        var seats = body.getChildByName('seats');

        if (!(dissolveNotice.active && this._popuproot.active)) {
            this.closeAll();
            this._popuproot.active = true;

			cc.vv.utils.showDialog(dissolveNotice, 'body', true);

            for (var i = 0; i < seats.childrenCount; i++) {
                var seat = seats.children[i];
                var icon = seat.getChildByName('icon');
                var imageLoader = icon.getComponent('ImageLoader');
                var name = seat.getChildByName('name').getComponent(cc.Label);

                imageLoader.setUserID(cc.vv.gameNetMgr.seats[i].userid);
                name.string = cc.vv.gameNetMgr.seats[i].name;
            }
        }

        var notice = ['(等待中)', '(拒绝)', '(同意)', '(离线)'];
        var color = [ new cc.Color(180, 180, 180, 255), new cc.Color(255, 0, 0, 255), new cc.Color(0, 255, 0, 255), new cc.Color(255, 0, 0, 255) ];

        for (var i = 0; i < seats.childrenCount; i++) {
            var seat = seats.children[i];
            var owner = seat.getChildByName('owner');
            var status = seat.getChildByName('status');
            var lblStatus = status.getComponent(cc.Label);

            var state = data.states[i];

            var showOwner = (state > 2);
            owner.active = showOwner;
            status.active = !showOwner;

            var online = data.online[i];
            if (!showOwner) {
                if (!online) {
                    state = 3;
                }

                lblStatus.string = notice[state];
                status.color = color[state];
            }
        }
        
        var check = [ false, false, false, false ];
        
        var btnAgree = body.getChildByName('btn_agree');
        var btnReject = body.getChildByName('btn_reject');
        var btnDissolve = body.getChildByName('btn_dissolve');
        var wait = body.getChildByName('wait');
        var seatIndex = cc.vv.gameNetMgr.seatIndex;
        
        var state = data.states[seatIndex];
        
        if (data.reason == 'offline') {
            check[2] = true;
        } else {
            if (state == 0) {
                check[0] = true;
                check[1] = true;
            } else {
                check[3] = true;
            }
        }
        
        btnAgree.active = check[0];
        btnReject.active = check[1];
        btnDissolve.active = check[2];
        wait.active = check[3];
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._endTime > 0) {
            var now = Date.now() / 1000;
            
            if (now == this._lastSeconds) {
                return;
            }
            
            this._lastSeconds = now;
            
            var lastTime = this._endTime - now;
            if (lastTime < 0) {
                this._endTime = -1;
                return;
            }
            
            var m = Math.floor(lastTime / 60);
            var s = Math.ceil(lastTime - m*60);
            
            m = m < 10 ? '0' + m : '' + m;
            s = s < 10 ? '0' + s : '' + s;
            
            this._noticeLabel.string = m + ':' + s + ' 后将解散房间';
        }
    },
});
