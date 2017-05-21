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
        _gameover: null,
        _gameresult: null,
        _seats: [],
        _isGameEnd: false,
        
        _pengTemp: null,
        _btnStart: null,
        _btnResult: null,
        _time: null,
        _roominfo: null,
		_lastSeconds: 0,
    },

    // use this for initialization
    onLoad: function() {
        if (cc.vv == null) {
            return;
        }

        if (cc.vv.gameNetMgr.conf == null) {
            return;
        }

        var gameover = this.node.getChildByName("game_over");
        this._gameover = gameover;

        gameover.active = false;

        var gameresult = this.node.getChildByName("game_result");
		this._gameresult = gameresult;

		this._time = cc.find('head/time', gameover).getComponent(cc.Label);

        var seats = gameover.getChildByName("seats");
        for (var i = 0; i < seats.childrenCount; i++) {
            var viewdata = {};
            var seat = seats.children[i];

            viewdata.username = seat.getChildByName('name').getComponent(cc.Label);
            viewdata.reason = seat.getChildByName('tips').getComponent(cc.Label);

            var statistics = seat.getChildByName("statistics");

            viewdata.statistics = statistics;
            viewdata.score = statistics.getChildByName("score").getComponent(cc.Label);
            viewdata.piao = statistics.getChildByName("piao").getComponent(cc.Label);
            viewdata.gang = statistics.getChildByName("gang").getComponent(cc.Label);
            viewdata.lblFan = statistics.getChildByName("lblFan");
            viewdata.fan = statistics.getChildByName("fan").getComponent(cc.Label);
            
            viewdata.action = seat.getChildByName("action");

            var mjs = seat.getChildByName("mjs");
            viewdata.mjs = mjs;

            viewdata._pengandgang = [];

            var penggangs = mjs.getChildByName('penggangs');
            viewdata.penggangs = penggangs;
            if (penggangs.childrenCount > 0) {
                var temp = penggangs.children[0];
                this._pengTemp = temp;
                
                penggangs.removeChild(temp);
            }
            
            this._seats.push(viewdata);
        }
        
        var btnStart = gameover.getChildByName('btnStart');
        cc.vv.utils.addClickEvent(btnStart, this.node, "GameOver","onBtnReadyClicked");
        this._btnStart = btnStart;

        var btnResult = gameover.getChildByName('btnResult');
        cc.vv.utils.addClickEvent(btnResult, this.node, "GameOver","onBtnReadyClicked");
        this._btnResult = btnResult;
        
        var btnShare = gameover.getChildByName('btnShare');
        cc.vv.utils.addClickEvent(btnShare, this.node, "GameOver","onBtnShareClicked");
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over', function(data) {
            var gameNetMgr = cc.vv.gameNetMgr;
    		self._roominfo = '房间号: ' + gameNetMgr.roomId + ' 局数: ' + gameNetMgr.numOfGames + '/' + gameNetMgr.maxNumOfGames;
    		//self.onGameOver(data.detail);
        });
        
        this.node.on('game_end', function(data) {
            self._isGameEnd = true;

            self._btnResult.active = true;
            self._btnStart.active = false;
        });
    },
    
    onGameOver: function(data) {
        //var type = gameNetMgr.conf.type;

        console.log('onGameOver');
		console.log(data);

        this.onGameOver_KWX(data);
    },
    
    onGameOver_KWX: function(odata) {
		var einfo = odata.info;
		var data = odata.results;
	
        if (data.length == 0) {
            this._gameresult.active = true;
            return;
        }

        this._gameover.active = true;

        var roominfo = cc.find('head/roominfo', this._gameover).getComponent(cc.Label);
        roominfo.string = this._roominfo;

		var title = cc.find('head/title', this._gameover).getComponent('SpriteMgr');

		var index = 0;
		var gameNetMgr = cc.vv.gameNetMgr;
		var conf = gameNetMgr.conf;
		var type = conf.type;

		if (einfo.dissolve) {
			index = 7;
		} else if (einfo.end) {
			index = 5;
		} else if (einfo.huangzhuang) {
			index = 8;
		} else if (type == 'xykwx') {
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
				index = 6;
			}
		} else if (type == 'yckwx') {
			index = 9;
		}

		title.setIndex(index);

        //显示玩家信息
        for (var i = 0; i < 3; i++) {
            var seatView = this._seats[i];
            var userData = data[i];
            var hued = false;
            var fangpao = false;
            var actionArr = [];
            var is7pairs = false;
            
            var mjs = seatView.mjs;
            var hupai = mjs.getChildByName('hupai');

            hupai.active = false;

            for (var j = 0; j < userData.huinfo.length; j++) {
                var info = userData.huinfo[j];
                hued = hued || info.ishupai;
                if(info.ishupai) {
                    hupai.active = true;

                    var nc = hupai.getChildByName('south_end');
                    var mj = nc.getComponent('Majiang');
                    nc.active = true;
                    mj.setMJID(info.pai);
                }
                
                var str = ""
                var sep = "";
                
                var dataseat = userData;
                if(!info.ishupai){
                    if(info.action == "fangpao"){
                        str = "放炮";
                    }
                    else if(info.action == "gangpao"){
                        str = "杠上炮";
                    }
                    else if(info.action == "beiqianggang"){
                        str = "被抢杠";
                    }
                    
                    fangpao = true;
                    
                    dataseat = data[info.target]; 
                    info = dataseat.huinfo[info.index];
                }
                else{
                    if(info.action == "hu"){
                        str = "接炮胡"
                    }
                    else if(info.action == "zimo"){
                        str = "自摸";
                    }
                    else if(info.action == "ganghua"){
                        str = "杠上花";
                    }
                    else if(info.action == "dianganghua"){
                        str = "点杠花";
                    }
                    else if(info.action == "gangpaohu"){
                        str = "杠炮胡";
                    }
                    else if(info.action == "qiangganghu"){
                        str = "抢杠胡";
                    }
                }
                
                str += "(";
                
                if(info.pattern == "7pairs"){
                    str += "七对";
                    sep = "、";
                }
                else if(info.pattern == "l7pairs"){
                    str += "豪华七对";
                    sep = "、";
                }
                else if(info.pattern == "2l7pairs"){
                    str += "超豪华七对";
                    sep = "、";
                }
                else if(info.pattern == "3y7pairs"){
                    str += "三元七对";
                    sep = "、";
                }
                else if(info.pattern == "3l7pairs"){
                    str += "超超豪华七对";
                    sep = "、";
                }
                else if(info.pattern == "duidui"){
                    str += "碰碰胡";
                    sep = "、";
                }

                if(dataseat.qingyise){
                    str += sep + "清一色";
                    sep = "、";
                }
                
                if(dataseat.jingouhu){
                    str += sep + "手抓一";
                    sep = "、";
                }
                
                if(dataseat.kawuxing){
                    str += sep + "卡五星";
                    sep = "、";
                }
                
                if(dataseat.mingsigui){
                    str += sep + "明四归";
                    sep = "、";
                }
                
                if(dataseat.ansigui){
                    str += sep + "暗四归";
                    sep = "、";
                }
                
                if(dataseat.dasanyuan){
                    str += sep + "大三元";
                    sep = "、";
                }
                
                if(dataseat.xiaosanyuan){
                    str += sep + "小三元";
                    sep = "、";
                }
                
                if (sep == "") {
                    str += "平胡";
                }
                
                if (userData.mingpai || dataseat.mingpai) {
                    str += sep + "明牌";
                }
                
                str += "、" + (1 << info.fan) + "番";
                
                str += ")";
                actionArr.push(str);
                
                if (info.ma != null) {
                    actionArr.push("自摸买马+" + info.ma);
                }
            }
            
            if (userData.firstmingpai) {
                actionArr.push("荒庄明牌");
            } else if (actionArr.length == 0 && userData.mingpai) {
                actionArr.push("明牌");
            }
            
            //seatView.hu.active = hued;
          
            for(var j = 0; j < userData.actions.length; ++j){
                var ac = userData.actions[j];
                var add = "";
                
                if (ac.fan && ac.fan > 0) {
                    add = "(杠上杠x" + ac.fan + ")";
                }
                
                if (ac.type == "fanggang") {
                    add += "放杠";
                } else if (ac.type == "angang") {
                    add += "暗杠";
                } else if (ac.type == "wangang") {
                    add += "弯杠";
                } else if (ac.type == "diangang") {
                    add += "点杠";
                }
                
                actionArr.push(add);
            }

            if (userData.piao != null && userData.piao > 0) {
                actionArr.push("漂" + userData.piao + "倍");
            }
            

            seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
            //seatView.zhuang.active = cc.vv.gameNetMgr.button == i;
            
            var detail = userData.detail;
            var hu = userData.hu;
            if (detail) {
                seatView.statistics.active = true;
                
                seatView.reason.string = detail.tips ? detail.tips : '';
                seatView.piao.string = '' + detail.piao;
                seatView.gang.string = '' + detail.gang;
                if (detail.fan > 0) {
                    seatView.fan.string = '' + detail.fan;
                    seatView.lblFan.active = true;
                } else {
                    seatView.fan.string = '';
                    seatView.lblFan.active = false;
                }
                
                if (detail.score >= 0) {
                    seatView.score.string = '+' + detail.score;
                } else {
                    seatView.score.string = detail.score;
                }
            } else {
                seatView.statistics.active = false;
            }

            var action = seatView.action;
            var spriteMgr = action.getComponent('SpriteMgr');
            if (hued) {
                action.active = true;
                spriteMgr.setIndex(0);
            } else if (fangpao) {
                action.active = true;
                spriteMgr.setIndex(1);
            } else if (hu.action == 'huangzhuang') {
				if (userData.peifu || userData.chajiao) {
					action.active = true;
					spriteMgr.setIndex(3);
				} else {
					action.active = false;
				}
            } else {
                action.active = false;
            }

            var holds = seatView.mjs.getChildByName("holds");
            for(var k = 0; k < holds.childrenCount; ++k){
                var n = holds.children[k];
                n.active = false;
            }
            
            cc.vv.mahjongmgr.sortMJ(userData.holds);
            
            var numOfGangs = userData.angangs.length + userData.wangangs.length + userData.diangangs.length;
           
            var lackingNum = (userData.pengs.length + numOfGangs)*3; 
            //显示相关的牌
            var total = userData.holds.length > 13 ? 13 : userData.holds.length;
            for(var k = 0; k < total; ++k) {
                var pai = userData.holds[k];
                var n = holds.children[k + lackingNum];
                n.active = true;
                
                var mj = n.getComponent("Majiang");
                mj.setMJID(pai);
            }

            for(var k = 0; k < seatView._pengandgang.length; ++k){
                seatView._pengandgang[k].active = false;
            }

            seatView.penggangs.width = 0;

            //初始化杠牌
            var index = 0;
            var gangs = userData.angangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"angang");
                index++;    
            }
            
            var gangs = userData.diangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"diangang");
                index++;    
            }
            
            var gangs = userData.wangangs;
            for(var k = 0; k < gangs.length; ++k){
                var mjid = gangs[k];
                this.initPengAndGangs(seatView,index,mjid,"wangang");
                index++;    
            }
            
            //初始化碰牌
            var pengs = userData.pengs
            if(pengs){
                for(var k = 0; k < pengs.length; ++k){
                    var mjid = pengs[k];
                    this.initPengAndGangs(seatView,index,mjid,"peng");
                    index++;    
                }    
            }
        }
    },
    
    initPengAndGangs:function(seatView,index,mjid,flag){
        var pgroot = null;
        var mgr = cc.vv.mahjongmgr;
        
        if(seatView._pengandgang.length <= index){
            pgroot = cc.instantiate(this._pengTemp);
            seatView._pengandgang.push(pgroot);
            seatView.penggangs.addChild(pgroot);    
        }
        else{
            pgroot = seatView._pengandgang[index];
            pgroot.active = true;
        }
        
        var side = 'south';
        for (var i = 0; i < pgroot.childrenCount; i++) {
            var child = pgroot.children[i];

            var board = child.getComponent(cc.Sprite);
            var tile = child.children[0].getComponent(cc.Sprite);

            if (child.name == "gang") {
                var isGang = flag != "peng";
                child.active = isGang;
                
                if (!isGang) {
                    continue;
                }

				board.spriteFrame = mgr.getBoardSpriteFrame(side, "end");
				tile.spriteFrame = mgr.getTileSpriteFrame(side, "end", mjid);
            } else {
	            if (flag == "angang") {
                    board.spriteFrame = mgr.getAnySpriteFrame(side, "end_background");
                    tile.spriteFrame = null;
                } else {
					board.spriteFrame = mgr.getBoardSpriteFrame(side, "end");
					tile.spriteFrame = mgr.getTileSpriteFrame(side, "end", mjid);
                }
            }
        }
    },
    
    onBtnReadyClicked: function() {
        console.log("onBtnReadyClicked");
        if (this._isGameEnd) {
            this._gameresult.active = true;
        }
        else {
            cc.vv.net.send('ready');   
        }
        this._gameover.active = false;
    },
    
    onBtnShareClicked: function() {
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
