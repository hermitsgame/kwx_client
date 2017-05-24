cc.Class({
    extends: cc.Component,

    properties: {
        _history: null,
        _historyRoom: null,
        _historyDetail: null,

        _roomItemTemp: null,
        _gameItemTemp: null,

        _historyData: null,
        _curRoomInfo: null,
        _emptyTip: null,

		_others: null,
    },

    // use this for initialization
    onLoad: function () {
        var history = this.node.getChildByName("history");
        this._history = history;
        history.active = false;
        
        var historyRoom = history.getChildByName('historyRoom');
        var historyDetail = history.getChildByName('historyDetail');
        this._historyRoom = historyRoom;
        this._historyDetail = historyDetail;

        var emptyTip = cc.find('body/emptyTip', historyRoom);
        this._emptyTip = emptyTip;

        var viewlist = cc.find('body/roomlist', historyRoom);
        var content = cc.find("view/content", viewlist);

        var temp = content.children[0];
        this._roomItemTemp = temp;
        content.removeChild(temp);
        
        var gamelist = cc.find('body/gamelist', historyDetail);
        var gamecontent = cc.find("view/content", gamelist);
        
        temp = gamecontent.children[0];
        this._gameItemTemp = temp;
        gamecontent.removeChild(temp);

        var node = cc.find("Canvas/bottom_right/btn_zhanji");
        this.addClickEvent(node, this.node, "History", "onBtnHistoryClicked");
        
        var node = cc.find('head/btnBack', historyRoom);
        this.addClickEvent(node, this.node, "History", "onBtnBackClicked");
        
        var node = cc.find('head/btnBack', historyDetail);
        this.addClickEvent(node, this.node, "History", "onBtnBackClicked");

		var node = cc.find('head/btnOthers', historyRoom);
		this.addClickEvent(node, this.node, "History", "onBtnOthersClicked");

		this._others = history.getChildByName('joinGame');
    },
    
    addClickEvent:function(node,target,component,handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

	onBtnOthersClicked: function() {
		this._others.active = true;
		cc.vv.utils.showDialog(this._others, 'panel', true);
    },

    onBtnBackClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
		cc.vv.wc.hide();

        if (this._curRoomInfo == null) {
            this._historyData = null;
			cc.vv.utils.showFrame(this._historyRoom, 'head', 'body', false, this._history);
        } else {
            this._historyRoom.active = true;

			cc.vv.utils.showFrame(this._historyDetail, 'head', 'body', false);
			
            this.initRoomHistoryList(this._historyData);
        }
    },
    
    onBtnHistoryClicked: function() {
        cc.vv.audioMgr.playButtonClicked();

        this._history.active = true;
        this._historyDetail.active = false;

		cc.vv.utils.showFrame(this._historyRoom, 'head', 'body', true);

        var self = this;

        cc.vv.userMgr.getHistoryList(function(data) {
			if (!data) {
				return;
			}

            data.sort(function(a,b) {
                return a.time < b.time; 
            });

            self._historyData = data;
            for(var i = 0; i < data.length; ++i){
                var numOfSeats = data[i].seats.length;
                for(var j = 0; j < numOfSeats; ++j){
                    var s = data[i].seats[j];
                    s.name = new Buffer(s.name,'base64').toString();
                }
            }

            self.initRoomHistoryList(data);
        });
    },
    
    dateFormat:function(time){
        var date = new Date(time);
        var datetime = "{0}-{1}-{2} {3}:{4}:{5}";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10? month : ("0"+month);
        var day = date.getDate();
        day = day >= 10? day : ("0"+day);
        var h = date.getHours();
        h = h >= 10? h : ("0"+h);
        var m = date.getMinutes();
        m = m >= 10? m : ("0"+m);
        var s = date.getSeconds();
        s = s >= 10? s : ("0"+s);
        datetime = datetime.format(year,month,day,h,m,s);
        return datetime;
    },

    initRoomHistoryList: function(data) {
        var userid = cc.vv.userMgr.userId;
        var content = cc.find("body/roomlist/view/content", this._historyRoom);
        
        for (var i = 0; i < data.length; i++) {
            var node = this.getRoomItem(i);
            var titleId = '' + (i + 1);

			node.idx = i;
            node.getChildByName('lblID').getComponent(cc.Label).string = titleId;
            //node.getChildByName('game_num').getComponent(cc.Label).string = ;
            node.getChildByName("room_id").getComponent(cc.Label).string = data[i].id;

            var datetime = this.dateFormat(data[i].time * 1000);
            node.getChildByName("lblTime").getComponent(cc.Label).string = datetime;

            var seats = node.getChildByName('seats');

            var id = 1;
            for (var j = 0; j < data[i].seats.length && id < seats.childrenCount; j++) {
                var s = data[i].seats[j];

                if (userid == s.userid) {
                    var seat = seats.children[0];
                    seat.getChildByName('score').getComponent(cc.Label).string = s.score;
                    continue;
                }

                var seat = seats.children[id];
                seat.getChildByName('lblName').getComponent(cc.Label).string = s.name;
                seat.getChildByName('score').getComponent(cc.Label).string = s.score;
                id++;
            }
        }

        this._emptyTip.active = data.length == 0;
        this.shrinkContent(content, data.length);
        this._curRoomInfo = null;
    },
    
    initGameHistoryList: function(roomInfo, data) {
/*
        data.sort(function(a, b) {
           return a.create_time < b.create_time; 
        });
*/
        var names = cc.find('body/title/seats', this._historyDetail);
        for (var i = 0; i < names.childrenCount; i++) {
            var name = names.children[i];
            var s = roomInfo.seats[i];

            name.getComponent(cc.Label).string = s.name;
        }

        var content = cc.find("body/gamelist/view/content", this._historyDetail);

        for (var i = 0; i < data.length; ++i) {
            var node = this.getGameItem(i);
            var idx = i;
            var titleId = '' + (idx + 1);
            
			node.idx = idx;

            node.getChildByName('lblID').getComponent(cc.Label).string = titleId;
            var datetime = this.dateFormat(data[i].create_time * 1000);
            node.getChildByName("lblTime").getComponent(cc.Label).string = datetime;
            
            var result = JSON.parse(data[i].result);

            var seats = node.getChildByName('seats');
            for (var j = 0; j < seats.childrenCount; j++) {
                var seat = seats.children[j];
                seat.getComponent(cc.Label).string = result[j];
            }
        }

        this.shrinkContent(content, data.length);
        this._curRoomInfo = roomInfo;
    },
    
    getRoomItem: function(index) {
        var content = cc.find("body/roomlist/view/content", this._historyRoom);

        if (content.childrenCount > index) {
            return content.children[index];
        }

        var node = cc.instantiate(this._roomItemTemp);
        content.addChild(node);
        return node;
    },

    getGameItem: function(index) {
        var content = cc.find("body/gamelist/view/content", this._historyDetail);

        if (content.childrenCount > index) {
            return content.children[index];
        }

        var node = cc.instantiate(this._gameItemTemp);
        content.addChild(node);
        return node;
    },

    shrinkContent: function(content, num) {
        while (content.childrenCount > num) {
            var lastOne = content.children[content.childrenCount -1];
            content.removeChild(lastOne, true);
        }
    },
    
    getGameListOfRoom: function(idx) {
        var self = this;
        var roomInfo = this._historyData[idx];
        cc.vv.userMgr.getGamesOfRoom(roomInfo.uuid, function(data) {
            if (data != null && data.length > 0) {
                self._historyRoom.active = false;

				cc.vv.utils.showFrame(self._historyDetail, 'head', 'body', true);

                self.initGameHistoryList(roomInfo, data);
            }
        });
    },
    
    getDetailOfGame: function(idx) {
        var self = this;
        var roomUUID = this._curRoomInfo.uuid;
        cc.vv.userMgr.getDetailOfGame(roomUUID,idx,function(data){
            data.base_info = JSON.parse(data.base_info);
            data.action_records = JSON.parse(data.action_records);
            cc.vv.gameNetMgr.prepareReplay(self._curRoomInfo, data);
            cc.vv.replayMgr.init(self._curRoomInfo, data);
            cc.director.loadScene("mjgame"); 
        });
    },
    
    onViewItemClicked:function(event) {
        cc.vv.audioMgr.playButtonClicked();

        var idx = event.target.idx;

        if (this._curRoomInfo == null) {
            this.getGameListOfRoom(idx);
        } else {
            this.getDetailOfGame(idx);      
        }
    },
    
    onBtnOpClicked:function(event){
        cc.vv.audioMgr.playButtonClicked();

        var idx = event.target.parent.idx;

        if (this._curRoomInfo == null) {
            this.getGameListOfRoom(idx);
        } else {
            this.getDetailOfGame(idx);      
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
