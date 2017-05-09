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
        _gameresult:null,
        _seats:[],

		_time: null,
		_roominfo: null,
		_lastSeconds: 0,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        var gameresult = this.node.getChildByName("game_result");
		this._gameresult = gameresult;

		this._time = cc.find('head/time', gameresult).getComponent(cc.Label);
		this._roominfo = cc.find('head/roominfo', gameresult).getComponent(cc.Label);
        
        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));   
        }
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
        }
        
        var btnShare = cc.find("Canvas/game_result/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end', function(data) {
			self.onGameEnd(data.detail);
		});
    },

    showResult: function(seat, info, shooter, winner) {
        seat.node.getChildByName('zimo').getComponent(cc.Label).string = info.numzimo;
        seat.node.getChildByName('hu').getComponent(cc.Label).string = info.numjiepao;
        seat.node.getChildByName('dianpao').getComponent(cc.Label).string = info.numdianpao;
        seat.node.getChildByName("angang").getComponent(cc.Label).string = info.numangang;
        seat.node.getChildByName("minggang").getComponent(cc.Label).string = info.numminggang;

        seat.node.getChildByName('winner').active = winner;
        seat.node.getChildByName('loser').active = shooter;
    },

    onGameEnd: function(endinfo) {
        var seats = cc.vv.gameNetMgr.seats;
        var maxscore = -1;
        var maxdianpao = 0;
        var dianpaogaoshou = -1;
        for (var i = 0; i < seats.length; ++i) {
            var seat = seats[i];
            if (seat.score > maxscore) {
                maxscore = seat.score;
            }
            if(endinfo[i].numdianpao > maxdianpao){
                maxdianpao = endinfo[i].numdianpao;
                dianpaogaoshou = i;
            }
        }

        for (var i = 0; i < seats.length; ++i) {
            var seat = seats[i];
            var isBigwin = false;
            if (seat.score > 0) {
                isBigwin = seat.score == maxscore;
            }

            this._seats[i].setInfo(seat.name, seat.score);
            this._seats[i].setID(seat.userid);

            var isZuiJiaPaoShou = dianpaogaoshou == i;
            this.showResult(this._seats[i], endinfo[i], isZuiJiaPaoShou, isBigwin);
        }

		var gameNetMgr = cc.vv.gameNetMgr;		
		this._roominfo.string = '房间号: ' + gameNetMgr.roomId + ' 局数: ' + gameNetMgr.numOfGames + '/' + gameNetMgr.maxNumOfGames;

		var title = cc.find('head/title', this._gameresult).getComponent('SpriteMgr');

		var index = 0;
		var gameNetMgr = cc.vv.gameNetMgr;
		var conf = gameNetMgr.conf;
		var type = conf.type;

		if (type == 'xykwx') {
			if (conf.pindao == 0) {
				index = 1;
			} else if (conf.pindao == 1) {
				index = 0;
			}
		} else if (type == 'sykwx') {
			index = 2;
		} else if (type == 'xgkwx') {
			index = 3;
		} else if (type == 'szkwx') {
			if (conf.maima == 1) {
				index = 4;
			} else {
				index = 5;
			}
		} else if (type == 'yckwx') {
			index = 6;
		}

		title.setIndex(index);
    },
    
    onBtnCloseClicked:function(){
        cc.director.loadScene("hall");
    },
    
    onBtnShareClicked:function(){
        cc.vv.audioMgr.playButtonClicked();

		setTimeout(function() {
			cc.vv.anysdkMgr.shareResult();
		}, 100);
    },

	curentTime: function() {
		var now = new Date();

		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var day = now.getDate();

		var hh = now.getHours();
		var mm = now.getMinutes();
		var ss = now.getSeconds();

		var clock = year + "-";

		if (month < 10) {
			clock += "0";
		}

		clock += month + "-";

		if (day < 10) {
			clock += "0";
		}

		clock += day + " ";

		if (hh < 10) {
			clock += "0";
		}

		clock += hh + ":";
		if (mm < 10) {
			clock += '0';
		}

		clock += mm + ":";

		if (ss < 10) {
			clock += '0';
		}

		clock += ss;
		
		return clock;
    },

    update: function (dt) {
		var seconds = Math.floor(Date.now()/1000);
        if (this._lastSeconds != seconds) {
            this._lastSeconds = seconds;

            this._time.string = this.curentTime();
        }
    },
});
