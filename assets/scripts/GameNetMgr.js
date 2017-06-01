cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler:null,
        roomId:null,
        maxNumOfGames:0,
        numOfGames:0,
        numOfMJ:0,
        seatIndex:-1,
        seats:null,
        numOfSeats: 0,
        turn:-1,
        button:-1,
        chupai:-1,
        gamestate: '',
        dices: null,
        isOver: false,
        dissoveData: null,
    },
    
    reset: function() {
        this.turn = -1;
        this.chupai = -1,
        this.button = -1;
        this.gamestate = '';
        this.curaction = null;
		this.dices = null;
        for (var i = 0; i < this.seats.length; i++) {
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].pengs = [];
            this.seats[i].angangs = [];
            this.seats[i].diangangs = [];
            this.seats[i].wangangs = [];
            this.seats[i].ready = false;
            this.seats[i].hued = false;
            this.seats[i].tings = [];
            this.seats[i].hasmingpai = false;
            this.seats[i].kou = [];
        }

        this.dissoveData = null;
    },
    
    clear: function() {
        this.dataEventHandler = null;
        if(this.isOver == null){
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;   
            this.numOfSeats = 0;
        }
    },
    
    dispatchEvent: function(event,data) {
        if(this.dataEventHandler){
            this.dataEventHandler.emit(event,data);
        }    
    },
    
    getSeatIndexByID:function(userId){
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            if(s.userid == userId){
                return i;
            }
        }
        return -1;
    },
    
    isOwner:function(){
        return this.seatIndex == 0;
    },
    
    getSeatByID:function(userId){
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    },
    
    getSelfData:function(){
        return this.seats[this.seatIndex];
    },
    
    getLocalIndex:function(index){
        var ret = 0;
        var nSeats = this.numOfSeats;
        
        ret = (index - this.seatIndex + nSeats) % nSeats;

        return ret;
    },
    
    prepareReplay:function(roomInfo,detailOfGame){
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.numOfSeats = roomInfo.seats.length;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            s.holds = baseInfo.game_seats[i].slice(0);
            s.pengs = [];
            s.angangs = [];
            s.diangangs = [];
            s.wangangs = [];
            s.folds = [];
            s.tings = [];
            s.hasmingpai = false;
            s.kou = [];

            if (cc.vv.userMgr.userId == s.userid) {
                this.seatIndex = i;
            }
        }

		var conf = baseInfo.conf;
        this.conf = conf;

		this.numOfGames = baseInfo.index + 1;
		this.maxNumOfGames = conf.maxGames;
    },
    
    getWanfa: function() {
        var conf = this.conf;
        var strArr = [];

        if (conf) {
			if (conf.maxGames != null && conf.maxFan != null) {
				var type = conf.type;
				if (type == "xykwx") {
					strArr.push("襄阳玩法");
				} else if (type == "xgkwx") {
				    strArr.push("孝感玩法");
				} else if (type == "szkwx") {
				    strArr.push("随州玩法");
				} else if (type == "sykwx") {
				    strArr.push("十堰玩法");
				} else if (type == "yckwx") {
				    strArr.push("宜城玩法");
				}

/*
                if (type == "xgkwx") { // TODO
                    strArr.push((1 << conf.maxFan) + "番封顶，亮倒16番封顶");
                } else {
				    strArr.push((1 << conf.maxFan) + "番封顶");
                }
*/
			}

            if (conf.pindao == 0) {
                strArr.push("全频道");
            } else if (conf.pindao == 1) {
                strArr.push("半频道");
            }
            
            if (conf.maima == 1) {
                strArr.push("自摸买马");
            } else if (conf.maima == 2) {
                strArr.push("亮倒自摸买马");
            }

            if (conf.shukan) {
                strArr.push('数坎');
            }

            if (conf.chkming) {
                strArr.push('少于12张不能明');
            }

            if (conf.partming) {
                strArr.push('部分亮');
            }
            
            if (conf.up) {
                strArr.push('上楼');
            }
            
            if (conf.chajiao) {
                strArr.push('查叫');
            }

            if (conf.pqmb) {
                strArr.push('跑恰摸八');
            }

            return strArr.join(' ');
        }

        return '';
	},
    
    needDingPiao: function() {
        var conf = this.conf;
        
        if (!conf || !conf.dingpiao || this.seatIndex < 0) {
            return false;
        }

        var seat = this.seats[this.seatIndex];
        if (seat.dingpiao == null || seat.dingpiao < 0) {
            return true;
        }
        
        return false;
    },
    
    initHandlers:function(){
        var self = this;
        cc.vv.net.addHandler("login_result",function(data){
            console.log(data);
            if(data.errcode === 0){
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.numOfSeats = data.numofseats;
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;
            }
            else{
                console.log(data.errmsg);   
            }
        });

        cc.vv.net.addHandler("login_finished",function(data){
            console.log("login_finished");
            cc.director.loadScene("mjgame");
        });

        cc.vv.net.addHandler("exit_result",function(data){
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });
        
        cc.vv.net.addHandler("exit_notify_push",function(data){
           var userId = data;
           var s = self.getSeatByID(userId);
           if(s != null){
               s.userid = 0;
               s.name = "";
               self.dispatchEvent("user_state_changed",s);
           }
        });
        
        cc.vv.net.addHandler("dispress_push",function(data){
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
        });
                
        cc.vv.net.addHandler("disconnect",function(data){
            if(self.roomId == null){
                cc.director.loadScene("hall");
            }
            else{
                if(self.isOver == false){
                    cc.vv.userMgr.oldRoomId = self.roomId;
                    self.dispatchEvent("disconnect");                    
                }
                else{
                    self.roomId = null;
                }
            }
        });
        
        cc.vv.net.addHandler("new_user_comes_push", function(data) {
            var seatIndex = data.seatindex;
            if(self.seats[seatIndex].userid > 0){
                self.seats[seatIndex].online = true;
            }
            else{
                data.online = true;
                self.seats[seatIndex] = data;
            }
            self.dispatchEvent('new_user',self.seats[seatIndex]);
        });
        
        cc.vv.net.addHandler("user_state_push",function(data){
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.online = data.online;
            self.dispatchEvent('user_state_changed',seat);
        });
        
        cc.vv.net.addHandler("user_ready_push",function(data){
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;

			if (self.gamestate == '') {
				self.dispatchEvent('user_state_changed', seat);
			}
        });

		cc.vv.net.addHandler("game_dice_push",function(data) {
			self.dices = data;
			self.dispatchEvent('game_dice', data);
        });
		
        cc.vv.net.addHandler("user_dingpiao_push",function(data) {
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.dingpiao = data.dingpiao;
            console.log("user_dingpiao_push: " + data.dingpiao);
            self.dispatchEvent('user_state_changed', seat);
        });
        
        cc.vv.net.addHandler("game_holds_push",function(data) {
            var seat = self.seats[self.seatIndex]; 
            console.log(data);
            seat.holds = data;
            
            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i]; 
                if(s.folds == null){
                    s.folds = [];
                }
                if(s.pengs == null){
                    s.pengs = [];
                }
                if(s.angangs == null){
                    s.angangs = [];
                }
                if(s.diangangs == null){
                    s.diangangs = [];
                }
                if(s.wangangs == null){
                    s.wangangs = [];
                }
                
                if (s.tings == null) {
                    s.tings = [];
                }
                
                if (s.kou == null) {
                    s.kou = [];
                }
                
                s.ready = false;
                
                self.dispatchEvent('user_state_changed', s);
            }

            self.dispatchEvent('game_holds');
        });

		cc.vv.net.addHandler("game_holds_update_push", function(data) {
			var seat = self.seats[self.seatIndex];

			console.log('game_holds_update_push');

            seat.holds = data;
			self.dispatchEvent('game_holds_update');
		});

		cc.vv.net.addHandler("game_holds_len_push", function(data) {
			var seatIndex = data.seatIndex;
			var seat = self.seats[seatIndex];

			console.log('game_holds_len_push');

            seat.holdsLen = data.len;
			self.dispatchEvent('game_holds_len', seat);
		});

		cc.vv.net.addHandler("game_holds_updated_push", function(data) {
			console.log('game_holds_updated_push');
			
			self.dispatchEvent('game_holds_updated');
		});
         
        cc.vv.net.addHandler("game_begin_push", function(data) {
            console.log('game_begin_push');
            console.log(data);
            self.button = data;
            self.turn = self.button;
            self.gamestate = "begin";

			for (var i = 0; i < self.seats.length; i++) {
                var s = self.seats[i]; 
                if (s.folds == null) {
                    s.folds = [];
                }

                if (s.pengs == null) {
                    s.pengs = [];
                }

                if (s.angangs == null) {
                    s.angangs = [];
                }

                if (s.diangangs == null) {
                    s.diangangs = [];
                }

                if (s.wangangs == null) {
                    s.wangangs = [];
                }
                
                if (s.tings == null) {
                    s.tings = [];
                }
                
                if (s.kou == null) {
                    s.kou = [];
                }
                
                s.ready = false;
                
                self.dispatchEvent('user_state_changed', s);
            }
			
            self.dispatchEvent('game_begin');
        });
        
        cc.vv.net.addHandler("game_playing_push",function(data){
            console.log('game_playing_push'); 
            self.gamestate = "playing"; 
            self.dispatchEvent('game_playing');
        });
        
        cc.vv.net.addHandler("game_sync_push",function(data){
            console.log("game_sync_push");
            console.log(data);
            self.numOfMJ = data.numofmj;
            self.gamestate = data.state;

            self.turn = data.turn;
            self.button = data.button;
            self.chupai = data.chuPai;
            self.numOfSeats = data.numOfSeats;
            for (var i = 0; i < self.numOfSeats; ++i) {
                var seat = self.seats[i];
                var sd = data.seats[i];
                seat.seatindex = i;
                seat.holds = sd.holds;
                seat.folds = sd.folds;
                seat.angangs = sd.angangs;
                seat.diangangs = sd.diangangs;
                seat.wangangs = sd.wangangs;
                seat.pengs = sd.pengs;
                seat.hued = sd.hued; 
                seat.iszimo = sd.iszimo;
                seat.huinfo = sd.huinfo;
                seat.tings = sd.tings;
                seat.hasmingpai = sd.mingpai;
                seat.dingpiao = sd.dingpiao;
                seat.kou = sd.kou;

				seat.ready = false;
           }

            for(var i = 0; i < self.numOfSeats; ++i) {
                var seat = self.seats[i];
                self.dispatchEvent('user_state_changed', seat);
            }

			self.doSync();
        });

        cc.vv.net.addHandler("hangang_notify_push",function(data){
            self.dispatchEvent('hangang_notify',data);
        });
        
        cc.vv.net.addHandler("game_action_push",function(data){
            self.curaction = data;
            console.log(data);
            self.dispatchEvent('game_action',data);
        });
        
        cc.vv.net.addHandler("game_chupai_push",function(data){
            console.log('game_chupai_push');
            var turnUserID = data;
            var si = self.getSeatIndexByID(turnUserID);
            self.doTurnChange(si);
        });
        
        cc.vv.net.addHandler("game_num_push",function(data){
            self.numOfGames = data;
            self.dispatchEvent('game_num',data);
        });

        cc.vv.net.addHandler("game_over_push", function(data) {
            var results = data.results;
            for (var i = 0; i <  self.seats.length; ++i) {
                self.seats[i].score = results.length == 0 ? 0:results[i].totalscore;
            }


            self.dispatchEvent('game_over', data);
            if (data.endinfo) {
                self.isOver = true;
                self.dispatchEvent('game_end', data.endinfo);
            }

            self.reset();
            for(var i = 0; i <  self.seats.length; ++i){
                self.dispatchEvent('user_state_changed',self.seats[i]);    
            }
        });
        
        cc.vv.net.addHandler("mj_count_push",function(data){
            console.log('mj_count_push');
            self.numOfMJ = data;
            self.dispatchEvent('mj_count',data);
        });
        
        cc.vv.net.addHandler("hu_push",function(data){
            console.log('hu_push');
            console.log(data);
            self.doHu(data);
        });
        
        cc.vv.net.addHandler("game_chupai_notify_push",function(data){
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doChupai(si,pai);
        });
        
        cc.vv.net.addHandler("game_mopai_push",function(data){
            console.log('game_mopai_push');
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doMopai(si, pai);
        });
        
        cc.vv.net.addHandler("guo_notify_push",function(data){
            console.log('guo_notify_push');
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doGuo(si,pai);
        });
        
        cc.vv.net.addHandler("guo_result",function(data){
            console.log('guo_result');
            self.dispatchEvent('guo_result');
        });
        
        cc.vv.net.addHandler("guohu_push",function(data){
            console.log('guohu_push');
            self.dispatchEvent("push_notice",{info:"过胡",time:1.5});
        });

        cc.vv.net.addHandler("peng_notify_push",function(data){
            console.log('peng_notify_push');
            console.log(data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doPeng(si,data.pai);
        });
        
        cc.vv.net.addHandler("gang_notify_push",function(data){
            console.log('gang_notify_push');
            console.log(data);
            var userId = data.userid;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);

			var fan = data.fan;
			var scores = data.scores;

			for (var i = 0; i <  self.seats.length; ++i) {
                self.seats[i].score += scores[i];
            }
/*
			for (var i = 0; i <  self.seats.length; ++i) {
                self.dispatchEvent('user_state_changed', self.seats[i]);
            }
*/
            self.doGang(si, pai, data.gangtype, fan, scores);
        });
        
        cc.vv.net.addHandler("ming_notify_push",function(data){
            console.log('ming_notify_push');
            var userId = data.userid;
            var tings = data.tings;
            var holds = data.holds;
            var kou = data.kou;
            var si = self.getSeatIndexByID(userId);
            self.doMing(si, holds, tings, kou);
        });

        cc.vv.net.addHandler("chat_push",function(data){
            self.dispatchEvent("chat_push",data);    
        });
        
        cc.vv.net.addHandler("quick_chat_push",function(data){
            self.dispatchEvent("quick_chat_push",data);
        });
        
        cc.vv.net.addHandler("emoji_push",function(data){
            self.dispatchEvent("emoji_push",data);
        });
        
        cc.vv.net.addHandler("dissolve_notice_push",function(data){
            self.dissoveData = data;
            self.dispatchEvent("dissolve_notice",data);
        });

		cc.vv.net.addHandler("dissolve_done_push",function(data){
            self.dissoveData = null;
            self.dispatchEvent("dissolve_done", data);
        });
        
        cc.vv.net.addHandler("dissolve_cancel_push",function(data){
            self.dissoveData = null;
            self.dispatchEvent("dissolve_cancel",data);
        });
        
        cc.vv.net.addHandler("voice_msg_push",function(data){
            self.dispatchEvent("voice_msg",data);
        });
    },
    
    doGuo:function(seatIndex, pai, skip) {
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);

		if (skip) {
			return;
		}

	    this.dispatchEvent('guo_notify',seatData);
    },

    doMopai:function(seatIndex, pai, skip) {
        var seatData = this.seats[seatIndex];
		var holds = seatData.holds;
        if (holds != null && holds.length > 0 && pai >= 0) {
            holds.push(pai);
        }

		if (skip) {
			return;
		}

        this.dispatchEvent('game_mopai',{seatIndex:seatIndex, pai:pai});
    },
    
    doChupai: function(seatIndex, pai, skip) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
		var holds = seatData.holds;
		
        if (holds != null && holds.length > 0) {             
            var idx = holds.indexOf(pai);
			if (idx != -1) {
 	           holds.splice(idx, 1);
			}
        }

		if (skip) {
			return;
		}

        this.dispatchEvent('game_chupai_notify', { seatData: seatData, pai: pai });    
    },

    doPeng: function(seatIndex, pai, skip) {
        var seatData = this.seats[seatIndex];
		var holds = seatData.holds;

        if (holds != null && holds.length > 0) {
            for (var i = 0; i < 2; ++i) {
                var idx = holds.indexOf(pai);
				if (idx == -1) {
					break;
				}

				holds.splice(idx, 1);
            }
        }

        var pengs = seatData.pengs;
        pengs.push(pai);

		if (skip) {
			return;
		}

        this.dispatchEvent('peng_notify', { seatData: seatData, pai: pai });
    },
    
    doMing:function(seatIndex, holds, tings, kou, skip) {
        var seatData = this.seats[seatIndex];
        
        seatData.hasmingpai = true;
        if (tings) {
            seatData.tings = tings;
        }
        
        if (kou) {
            seatData.kou = kou;
        }
        
        if (seatIndex != this.seatIndex && holds) {
            seatData.holds = holds;
        }

		if (skip) {
			return;
		}

        this.dispatchEvent('ming_notify', seatData);
    },
    
    getGangType: function(seatData, pai) {
        if(seatData.pengs.indexOf(pai) != -1){
            return "wangang";
        }
        else{
            var cnt = 0;
            for(var i = 0; i < seatData.holds.length; ++i){
                if(seatData.holds[i] == pai){
                    cnt++;
                }
            }
            if(cnt == 3){
                return "diangang";
            }
            else{
                return "angang";
            }
        }
    },
    
    doGang: function(seatIndex, pai, gangtype, fan, scores, skip) {
        var seatData = this.seats[seatIndex];
		var holds = seatData.holds;

		console.log('doGang, si=' + seatIndex);
		
        if(!gangtype){
            gangtype = this.getGangType(seatData,pai);
        }
        
        if(gangtype == "wangang"){
            if(seatData.pengs.indexOf(pai) != -1){
                var idx = seatData.pengs.indexOf(pai);
                if(idx != -1){
                    seatData.pengs.splice(idx,1);
                }
            }
            seatData.wangangs.push(pai);
        }

        if (holds != null && holds.length > 0) {
            for (var i = 0; i < 4; ++i) {
                var idx = holds.indexOf(pai);
                if (idx == -1) {
                    break;
                }

                holds.splice(idx, 1);
            }
        }
		
        if (seatData.kou) {
            var id = seatData.kou.indexOf(pai);
            if (id != -1) {
                seatData.kou.splice(id, 1);
            }
        }

        if (gangtype == "angang") {
            seatData.angangs.push(pai);
        }
        else if(gangtype == "diangang") {
            seatData.diangangs.push(pai);
        }

		if (skip) {
			return;
		}

        this.dispatchEvent('gang_notify', { seatData: seatData, gangtype: gangtype, pai: pai, fan: fan, scores: scores});
    },
    
    doHu: function(data, skip) {
		if (skip) {
			return;
		}

        this.dispatchEvent('hupai', data);
    },
    
    doTurnChange: function(si, skip) {
        var data = {
            last: this.turn,
            turn: si,
        }

        this.turn = si;

		if (skip) {
			return;
		}
		
        this.dispatchEvent('game_chupai',data);
    },

	doSync: function() {
		this.dispatchEvent('game_sync');
    },
    
    connectGameServer:function(data){
        this.dissoveData = null;
        cc.vv.net.ip = data.ip + ":" + data.port;
        console.log(cc.vv.net.ip);
        var self = this;

        var onConnectOK = function(){
            console.log("onConnectOK");
            var sd = {
                token:data.token,
                roomid:data.roomid,
                time:data.time,
                sign:data.sign,
            };
            cc.vv.net.send("login",sd);
        };
        
        var onConnectFailed = function(){
            console.log("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show(2);
        cc.vv.net.connect(onConnectOK,onConnectFailed);
    },

    checkCanChuPai: function(mjid) {
        var seats = this.seats;
        var found  = false;

        for (var i = 0; i < seats.length; i++) {
            var sd = seats[i];
            if (i == this.seatIndex) {
                continue;
            }

            var tings = sd.tings;

            if (tings && tings.indexOf(mjid) >= 0) {
                found = true;
                break;
            }
        }
        
        return !found;
    },

	getChuPaiList: function() {
		var seat = this.seats[this.seatIndex];
		var holds = seat.holds;
		var chupais = [];

		for (var i = 0; i < holds.length; i++) {
			var pai = holds[i];

			if (chupais.indexOf(pai) == -1 && this.checkCanChuPai(pai)) {
				chupais.push(pai);
			}
		}

		return chupais;
    },

    refreshMJ: function(data) {
        this.dispatchEvent("refresh_mj");
    },

    refreshBG: function(data) {
        console.log('refreshBG');
        this.dispatchEvent("refresh_bg", data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
