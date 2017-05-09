

cc.Class({
    extends: cc.Component,

    properties: {        
        gameRoot:{
            default:null,
            type:cc.Node
        },
        
        prepareRoot:{
            default:null,
            type:cc.Node   
        },

        _options:null,
        _optionsData: null,

        _selectedMJ:null,
        _chupais: [],
        _mopais: [],

        _mjcount: null,
        _gamecount: null,
        _hupaiTips: [],

        _huPrompts:[],
        _huTemplates: [],
        
        _playEfxs:[],

        _mingOpt: null,
        _kouOpt: null,
        
        _mingState: -1,
        _gangState: -1,
        
        _myMJArr: [],
        
        _bgMgr: null,
        _maima: null,
        
        _acting: 0,
        _gameover: null,
    },
    
    onLoad: function() {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }

        if (!cc.vv) {
            cc.director.loadScene("loading");
            return;
        }

        this.addComponent("GameOver");
        this.addComponent("PengGangs");
        this.addComponent("MJRoom");
        this.addComponent("TimePointer");
        this.addComponent("GameResult");
        this.addComponent("Chat");
        this.addComponent("Folds"); 
        this.addComponent("ReplayCtrl");
        this.addComponent("PopupMgr");
        this.addComponent("ReConnect");
        this.addComponent("Voice");

        this.initView();
        this.initEventHandlers();

        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        this.initWanfaLabel();
        this.onGameBegin();
        //cc.vv.audioMgr.playBGM("bgFight.mp3");
		cc.vv.audioMgr.playBackGround();
    },
    
    initView: function() {
        //搜索需要的子节点
        var gameChild = this.node.getChildByName("game");

        this._mjcount = cc.find("mj_count/mj_count", gameChild).getComponent(cc.Label);
        this._mjcount.string = cc.vv.gameNetMgr.numOfMJ;
        this._gamecount = cc.find("Canvas/infobar/room/game_count").getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + " / " + cc.vv.gameNetMgr.maxNumOfGames;

        var south = gameChild.getChildByName("south");
        var layout = south.getChildByName("layout");
        var myholds = cc.find("layout/holds", south);

        for (var i = 0; i < myholds.children.length; ++i) {
            var child = myholds.children[i];
            var mj = child.getComponent("SmartMJ");
            if (!mj) {
                continue;
            }

            this._myMJArr.push(mj);
        }

        var realwidth = cc.director.getVisibleSize().width;
        var realheight = cc.director.getVisibleSize().height;

        layout.scaleX *= realwidth/1280;
        layout.scaleY *= realwidth/1280;

        var sides = ["south","east","west"];
        for (var i = 0; i < sides.length; ++i) {
            var side = sides[i];

            var sideChild = gameChild.getChildByName(side);
            this._hupaiTips.push(sideChild.getChildByName("hupai"));
            
            var prompt = sideChild.getChildByName("huPrompt");
            var hulist = cc.find("hupais/hulist", prompt);
            var temp = hulist.children[0];
            hulist.removeAllChildren();
            this._huPrompts.push(prompt);
            this._huTemplates.push(temp);
            
            this._playEfxs.push(sideChild.getChildByName("play_efx").getComponent(cc.Animation));
            this._chupais.push(sideChild.getChildByName("chupai").children[0]);
            
            var mopai = sideChild.getChildByName("mopai");
            if (mopai) {
                var mopai2 = cc.find("layout/mopai", sideChild);
                var data = { back: mopai.children[0], table: mopai2 };
                
                this._mopais.push(data);
            } else {
                this._mopais.push(null);
            }
        }

        var opts = gameChild.getChildByName("options");
        this._options = opts;
        this.hideOptions();
        this.hideChupai();
        this.hideMopai();
        
        var mingOpt = gameChild.getChildByName("mingOpt");
        this._mingOpt = mingOpt;
        this.showMingOpt(false);
        
        var kouOpt = gameChild.getChildByName("kouOpt");
        this._kouOpt = kouOpt;
        this.showKouOpt(false);
        
        var gangOpt = gameChild.getChildByName("gangOpt");
        this._gangOpt = gangOpt;
        this.showGangOpt(false);

        var bg = cc.find('Canvas/bg');
        var bgMgr = bg.getComponent('SpriteMgr');
        var mgr = cc.vv.mahjongmgr;

        bgMgr.setIndex(mgr.getBGStyle());
        this._bgMgr = bgMgr;

        this._maima = cc.find('Canvas/maima');
        this.hideMaiMa();
    },

    hideMaiMa: function() {
        this._maima.active = false;
    },

    showMaiMa: function(ma, fan, cb) {
        var maima = this._maima;
        var board = maima.getChildByName('board');
        var tile = board.getChildByName('tile').getComponent('SpriteMgr');
        var layout = maima.getChildByName('layout');
        var num = layout.getChildByName('num').getComponent(cc.Label);
        var anim = board.getComponent(cc.Animation);
        var style = cc.vv.mahjongmgr.getMJStyle();

        maima.active = true;
        tile.setIndex(-1);
        layout.active = false;

        var self = this;

        var fn = function() {
            layout.active = true;
            num.string = fan;
            
            var mj = ma < 18 ? ma : ma - 9;
            tile.setIndex(mj);

            setTimeout(function() {
                maima.active = false;
                if (cb) {
                    cb();
                }
            }, 2000);
            
            anim.off('finished', fn);
        };

        anim.on('finished', fn);

        console.log('showMaiMa');

        anim.play('maima1');    // TODO
    },
    
    hideChupai:function() {
        for (var i = 0; i < this._chupais.length; ++i) {
            this._chupais[i].active = false;
        }        
    },

    hideMopai:function() {
        var mopais = this._mopais;
        for (var i = 0; i < mopais.length; ++i) {
            var mopai = mopais[i];

            if (mopai) {
                mopai.back.active = false;
                mopai.table.active = false;
            }
        }
    },
    
    showMingOpt: function(enable) {
        this._mingOpt.active = enable;
    },
    
    showKouOpt: function(enable) {
        this._kouOpt.active = enable;
    },
    
    showGangOpt: function(enable) {
        this._gangOpt.active = enable;
    },
    
    initEventHandlers:function(){
        cc.vv.gameNetMgr.dataEventHandler = this.node;
        
        //初始化事件监听器
        var self = this;
        
        this.node.on('game_holds',function(data) {
           self.initMahjongs();
           self.checkChuPai(true);
        });
        
        this.node.on('game_begin',function(data){
            self.onGameBegin();
        });
        
        this.node.on('game_sync',function(data){
            self.onGameBegin();
        });
        
        this.node.on('game_chupai',function(data){
            data = data.detail;
            self.hideChupai();
            if (data.last != cc.vv.gameNetMgr.seatIndex) {
                self.showMopai(data.last, null);
            }
/*
            if(!cc.vv.replayMgr.isReplay() && data.turn != cc.vv.gameNetMgr.seatIndex){
                self.showMopai(data.turn,-1);
            }
*/
        });
        
        this.node.on('game_mopai',function(data) {
            self.hideChupai();
            data = data.detail;
            var pai = data.pai;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(data.seatIndex);
            
            if (localIndex == 0) {
                var mj = self._myMJArr[13];
                var seats = cc.vv.gameNetMgr.seats;
                var seatData = seats[cc.vv.gameNetMgr.seatIndex];
                var show = (seatData.hasmingpai || seatData.hued || cc.vv.replayMgr.isReplay());

                mj.node.active = true;
                mj.setFunction(show ? 1 : 0);
                mj.setMJID(pai);
                mj.setKou(false);

                self.checkChuPai(true);
            }
            else if (cc.vv.replayMgr.isReplay()) {
                self.showMopai(data.seatIndex, pai);
            } else {
                self.showMopai(data.seatIndex, pai);
            }
        });
        
        this.node.on('game_action',function(data){
            self.showAction(data.detail);
        });
        
        this.node.on('hupai',function(data) {
            var data = data.detail;
            //如果不是玩家自己，则将玩家的牌都放倒
            var seatIndex = data.seatindex;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
            var hupai = self._hupaiTips[localIndex];
            hupai.active = true;
            
            if (localIndex == 0) {
                self.hideOptions();
            }
            var seatData = cc.vv.gameNetMgr.seats[seatIndex];
            seatData.hued = true;
            var type = cc.vv.gameNetMgr.conf.type;
            
            hupai.getChildByName("sprHu").active = true;

			if (data.holds) {
				seatData.holds = data.holds;
			}

            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
            }
            else {
                self.initOtherMahjongs(seatData);
            }

			if (cc.vv.replayMgr.isReplay()) {
				var action = data.iszimo ? 'zimo' : 'chi';

				self.playEfx(localIndex, action);
				cc.vv.audioMgr.playHu(action);
			}
        });
        
        this.node.on('mj_count',function(data) {
            self._mjcount.string = cc.vv.gameNetMgr.numOfMJ;;
        });
        
        this.node.on('game_num',function(data){
            self._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + " / " + cc.vv.gameNetMgr.maxNumOfGames;
        });

        this.node.on('game_over', function(data) {
			var go_data = data.detail;

            self.playHuAction(go_data.results, function() {
				self.doGameOver(go_data);
            });
        });
        
        
        this.node.on('game_chupai_notify', function(data) {
            self.hideChupai();
            var seatData = data.detail.seatData;
            //如果是自己，则刷新手牌
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
				self.checkChuPai(false);
            }
            else {
                self.initOtherMahjongs(seatData);
            }

            self.hideMopai();
            self.showChupai();
            var content = cc.vv.mahjongmgr.getAudioContentByMJID(data.detail.pai);
            cc.vv.audioMgr.playCard(content);
        });
        
        this.node.on('guo_notify',function(data){
            self.hideChupai();
            self.hideOptions();
            var seatData = data.detail;
            //如果是自己，则刷新手牌
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();                
            }

            //cc.vv.audioMgr.playSFX("give.mp3");
        });
        
        this.node.on('guo_result',function(data) {
            self.hideOptions();
        });
        
        this.node.on('game_dingque_finish',function(data) {
            self.initMahjongs();
        });
        
        this.node.on('peng_notify',function(data){    
            self.hideChupai();
            
            var seatData = data.detail;
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex){                
                self.initMahjongs();
				self.checkChuPai(true);
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = self.getLocalIndex(seatData.seatindex);
            self.playEfx(localIndex, 'peng');
			cc.vv.audioMgr.playAction('peng');
			
            self.hideOptions();
        });
        
        this.node.on('ming_notify', function(data) {
            var seatData = data.detail;
            
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
            }
            else{
                self.initOtherMahjongs(seatData);
            }

            var localIndex = self.getLocalIndex(seatData.seatindex);
            if (seatData.hasmingpai && seatData.tings) {
                self.showMingpai(localIndex, seatData.tings);
            }
            
            if (0 == localIndex) {
                self.checkChuPai(true);
            }

            self.playEfx(localIndex, 'ming');
			cc.vv.audioMgr.playAction('ming');
        });
        
        this.node.on('gang_notify',function(data) {
            self.hideChupai();
            var data = data.detail;
            var seatData = data.seatData;
            var gangtype = data.gangtype;
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
				self.checkChuPai(true);
            }
            else{
                self.initOtherMahjongs(seatData);
            }
            
            var localIndex = self.getLocalIndex(seatData.seatindex);
			var scores = data.scores;
			self.playEfx(localIndex, 'gang', function() {
				// TODO 
			});

			var fan = data.fan;
			if (fan > 0) {
				cc.vv.audioMgr.playAction('zaigang');
			} else {
				cc.vv.audioMgr.playAction('gang');
			}
/*
            if (gangtype == "angang") {
                cc.vv.audioMgr.playAction('angang');
            } else {
                cc.vv.audioMgr.playAction('gang');
            }
*/
        });
        
        this.node.on("hangang_notify",function(data){
            var data = data.detail;
            var localIndex = self.getLocalIndex(data);
            //self.playEfx(localIndex,"gang");
            //cc.vv.audioMgr.playAction('gang');
            self.hideOptions();
        });
        
        this.node.on('refresh_mj', function() {
            self.refreshMJ();
        });

        this.node.on('refresh_bg', function(data) {
            self._bgMgr.setIndex(data.detail);
        });

		for (var i = 0; i < this._myMJArr.length; i++) {
			var mj = this._myMJArr[i];
			var node = mj.node;

			node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
				if (self._mingState == -1 && self._gangState == -1) {
					var pai = event.target.getComponent('SmartMJ');
					if (pai.getInteractable()) {
						self.shoot(pai.mjid);
						if (self._selectedMJ) {
							self._selectedMJ.y = 0;
							self._selectedMJ = null;
						}
					}
				}
			});
		}
    },

	doGameOver: function(data) {
		this.gameRoot.active = false;
		this.prepareRoot.active = true;

		var gameover = this.node.getComponent('GameOver');
		gameover.onGameOver(data);
    },

    playHuAction: function(data, cb) {
		var results = data;
		var done = 0;
		var maima = null;
		var self = this;

		var fnCB = function() {
			console.log('fbCB');
			done += 1;

			if (done == 3) {
				if (maima) {
					self.showMaiMa(maima.pai, maima.fan, function() {
						if (cb) {
							cb();
						}
					});
				} else {
					if (cb) {
						cb();
					}
				}
			}
		};

		var playActions = function(hu, callback) {
			var index = hu.index;
			var acts = hu.actions;

			console.log(acts);

            var fnPlay = function(actions) {
                if (actions && actions.length > 0) {
                    var act = actions.pop();

					console.log('playing ' + act + '@' + index);

					if (hu.hued) {
						self.playEfx(index, act);

	                    cc.vv.audioMgr.playHu(act, function() {
							setTimeout(function() {
								fnPlay(actions);
							}, 500);
                	    });
					} else {
						self.playEfx(index, act, function() {
							setTimeout(function() {
								fnPlay(actions);
							}, 500);
						});
					}
                } else {
                    if (callback) {
                        callback();
                    }
                }
            };
        
            fnPlay(acts);
        };

		for (var i = 0; i < results.length; i++) {
			var result = results[i];

			if (result.maima) {
				maima = result.maima;
				break;
			}
		}

		for (var i = 0; i < results.length; i++) {
			var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
			var result = results[i];
			var hu = result.hu;
			var actions = [];

			if (!hu) {
				fnCB();
				continue;
			}

			hu.index = localIndex;

			var act = hu.action;

			if (hu.numDianPao == 2) {
				actions.push('yipaoduoxiang');
			} else if (act == 'gangpao') {
				actions.push('gangshangpao');
			} else if (act == 'fangpao') {
				actions.push('dianpao');
			} else if (act == 'huangzhuang') {
				actions.push('huangzhuang');
			} else if (hu.hued) {
				var type = hu.typeOf7Pairs;
				if (type == '3d') {
					actions.push('chaochaohaohua');
				} else if (type == '2d') {
					actions.push('chaohaohua');
				} else if (type == '1d') {
					actions.push('haohuaqiduiI');
				} else if (type != null) {
					actions.push('qiduihuapai');
				}

				if (hu.isHaiDiLao) {
					actions.push('haidelao');
				}

				if (hu.isHaiDiPao) {
					actions.push('haidipao');
				}

				if (hu.isAnSiGui) {
					actions.push('ansigui');
				}

				if (hu.isMingSiGui) {
					actions.push('mingsigui');
				}

				if (hu.isKaWuXing) {
					actions.push('kawuxing');
				}

				if (hu.isDuiDuiHu) {
					actions.push('pengpeng');
				}

				if (hu.isJinGouHu == true) {
					actions.push('shouzhuayi');
				}
        
				if (hu.isDaSanYuan) {
					actions.push('dasanyuan');
				} else if (hu.isXiaoSanYuan) {
					actions.push('xiaosanyuan');
				}
        
				if (hu.qingyise) {
					actions.push('qingyise');
				}

				if (act == 'ganghua') {
					actions.push('gangkaihua');
				} else if (act == 'qiangganghu') {
					actions.push('qianggang');
				} else if (act == 'zimo') {
					actions.push('zimo');
				} else if (act == 'hu') {
					actions.push('chi');
				}
			}

			hu.actions = actions;

			playActions(hu, function() {
				fnCB();
        	});
		}
    },
    
    refreshMJ: function() {
        if (!this.gameRoot.active) {
                return;
        }
            
        this.initMahjongs(true);
        var seats = cc.vv.gameNetMgr.seats;
        for (var i in seats) {
            var seatData = seats[i];
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
            if(localIndex != 0) {
                this.initOtherMahjongs(seatData, true);
            }
        }

        for (var i = 0; i < this._huTemplates.length; i++) {
            var temp = this._huTemplates[i];
            var mj = temp.getComponent('Majiang');
            mj.refresh();
        }
        
        for (var i = 0; i < this._huPrompts.length; i++) {
            var prompt = this._huPrompts[i];
            var hulist = cc.find("hupais/hulist", prompt);
            
            for (var j = 0; j < hulist.childrenCount; j++) {
                var pai = hulist.children[j];
                var mj = pai.getComponent('Majiang');
                mj.refresh();
            }
        }

        for (var i = 0; i < this._chupais.length; i++) {
            var chupai = this._chupais[i];
            var mj = chupai.getComponent('Majiang');
            mj.refresh();
        }

        for (var i = 0; i < this._mopais.length; i++) {
            var mopai = this._mopais[i];
            if (!mopai) {
                continue;
            }
            
            var back = mopai.back;
            var sptBack = back.getComponent('Majiang');
            sptBack.refresh();
            
            var table = mopai.table;
            var sptTable = table.getComponent('SmartMJ');
            sptTable.refresh();
        }
    },
    
    showChupai:function(){
        var pai = cc.vv.gameNetMgr.chupai; 
        if( pai >= 0 ) {
            var localIndex = this.getLocalIndex(cc.vv.gameNetMgr.turn);
            var chupai = this._chupais[localIndex];
            var mj = chupai.getComponent("Majiang");

            mj.setMJID(pai);
            chupai.active = true;

			var self = this;

			setTimeout(function() {
				chupai.active = false;
			}, 500);
        }
    },
    
    addOption: function(name) {
        var ops = [ "peng", "gang", "hu", "ming", "guo" ];
        
        var id = ops.indexOf(name);
        if (id == -1) {
            console.log("addOption: unknown option name");
            return;
        }

        for (var i = 0; i < this._options.childrenCount; ++i) {
            var child = this._options.children[i];
            if (child.name == "op" && child.active == false) {
                child.active = true;
                
                var sprite = child.getComponent("SpriteMgr");
                sprite.setIndex(id);
                break;
            }
        }
    },

    hideOptions:function(data) {
        var options = this._options;
        options.active = false;
        for (var i = 0; i < options.childrenCount; ++i) {
            var child = options.children[i];
            if (child.name == "op") {
                child.active = false;
            }
        }
    },
    
    hasOptions: function() {
        return this._options.active;
    },
    
    showAction:function(data) {
        var options = this._options;
        this._optionsData = data;

        if (options.active) {
            this.hideOptions();
        }

        if (data && (data.hu || data.gang || data.peng || data.ming)) {
            options.active = true;
            
            this.addOption("guo");
            
            if (data.ming) {
                this.addOption("ming");

                data.mings = data.mingpai.slice(0);

                this.showTings(true);
            }

            if (data.hu) {
                this.addOption("hu");
            }

            if (data.gang) {
                this.addOption("gang");
            }
            
            if (data.peng) {
                this.addOption("peng");
            }
        }
    },
    
    initWanfaLabel:function(){
        var wanfa = cc.find("Canvas/infobar/wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
    },
    
    showMingpai: function(localIndex, tings) {
        var huPrompt = this._huPrompts[localIndex];
        var huTemplate = this._huTemplates[localIndex];

		var hupais = huPrompt.getChildByName('hupais');
        var hulist = hupais.getChildByName('hulist');

        hulist.removeAllChildren();

        for (var i = 0; i < tings.length; i++) {
            var hu = cc.instantiate(huTemplate);
            var mj = hu.getComponent("Majiang");

            mj.setMJID(tings[i]);
            hulist.addChild(hu);
        }

		hupais.active = tings.length > 0;
        huPrompt.active = true;
    },
    
    hideMingpai: function(localIndex) {
        var huPrompt = this._huPrompts[localIndex];
        huPrompt.active = false;
    },
    
    playEfx:function(index, name, cb) {
        var anim = this._playEfxs[index];
        anim.node.active = true;

		var fn = function() {
			if (cb) {
				cb();
				anim.off('finished', fn);
			}
		};

		if (cb) {
			anim.on('finished', fn);
		}

        var state = anim.play(name);
//		if (!state) {
//			fn();
//		}
    },
    
    onGameBegin:function() {
        this._acting = 0;
        this._gameover = null;

        for (var i = 0; i < this._playEfxs.length; ++i) {
            this._playEfxs[i].node.active = false;
        }
        
        for (var i = 0; i < this._huPrompts.length; ++i) {
            this._huPrompts[i].active = false;
        }
        
        for (var i = 0; i < cc.vv.gameNetMgr.seats.length; ++i) {
            var seatData = cc.vv.gameNetMgr.seats[i];
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
            var hupai = this._hupaiTips[localIndex];
            hupai.active = seatData.hued;
            if (seatData.hued) {
                hupai.getChildByName("sprHu").active = true;
            }

            if (seatData.hasmingpai && seatData.tings) {
                this.showMingpai(localIndex, seatData.tings);
            }
        }
        
        this.hideChupai();
        this.hideOptions();
        var sides = ["west", "east"];        
        var gameChild = this.node.getChildByName("game");
        for (var i = 0; i < sides.length; ++i) {
            var sideChild = gameChild.getChildByName(sides[i]);
            var holds = cc.find("layout/holds", sideChild);
            var layout = holds.getComponent(cc.Layout);
            for(var j = 0; j < holds.childrenCount; ++j){
                var nc = holds.children[j];
                var mj = nc.getComponent("SmartMJ");

                nc.active = true;

                if (mj) {
                    mj.setFunction(0);
                }
            }

            layout.spacingY = -2;
        }

        if (cc.vv.gameNetMgr.gamestate == "" && cc.vv.replayMgr.isReplay() == false) {
            return;
        }

        this.gameRoot.active = true;
        this.prepareRoot.active = false;
        this.initMahjongs(true);
        var seats = cc.vv.gameNetMgr.seats;
        for (var i in seats) {
            var seatData = seats[i];
			var show = seatData.hasmingpai || cc.vv.replayMgr.isReplay();
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
            if (localIndex != 0) {
                this.initOtherMahjongs(seatData);
                if (i == cc.vv.gameNetMgr.turn) {
					var mopai = show ? seatData.holds[seatData.holds.length - 1] : -1;
                    this.showMopai(i, mopai);
                }
                else {
                    this.showMopai(i, null);
                }
            }
        }

        this.showChupai();
        if(cc.vv.gameNetMgr.curaction != null){
            this.showAction(cc.vv.gameNetMgr.curaction);
            cc.vv.gameNetMgr.curaction = null;
        }

		if (cc.vv.gameNetMgr.seatIndex == cc.vv.gameNetMgr.turn) {
			this.checkChuPai(true);
		}
    },
    
    onMJClicked:function(event) {
        if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
            console.log("not your turn." + cc.vv.gameNetMgr.turn);
            return;
        }

        for (var i = 0; i < this._myMJArr.length; ++i) {
            var mj = this._myMJArr[i];
            if (event.target == mj.node) {
                if (this._mingState == 0 || this._gangState == 0) {
                    if(this._selectedMJ != null){
                        this._selectedMJ.y = 0;
                    }
                    
                    this.onMJChoosed(mj);
                    return;
                } else {
                    //如果是再次点击，则出牌
                    if (event.target == this._selectedMJ) {
                        this.shoot(mj.mjid); 
                        this._selectedMJ.y = 0;
                        this._selectedMJ = null;
                        return;
                    }
                    if(this._selectedMJ != null){
                        this._selectedMJ.y = 0;
                    }
                    event.target.y = 15;
                    this._selectedMJ = event.target;
                    this.onMJChoosed(mj);
                    return;
                }
            }
        }
    },
    
    onMJChoosed: function(mj) {
        var mjid = mj.mjid;
        
        var options = this._optionsData;
        var mgr = cc.vv.mahjongmgr;

        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = seatData.holds;

        if (this._mingState == 0) {
            var canKou = options.canKou;
            var kou = options.kou;
            
            if (canKou && canKou.indexOf(mjid) != -1) {
                kou.push(mjid);
            } else if (kou && kou.indexOf(mjid) != -1) {
                var idx = kou.indexOf(mjid);
                kou.splice(idx, 1);
            }
            
            options.canKou = mgr.checkKouPai(holds, kou);
            options.mings = mgr.getMings(holds, kou);

            this.checkKouPai(true);
            
        } else if (this._mingState == 1) {
            var tings = mgr.getTings(holds, options.kou, mjid);
            this.showMingpai(0, tings);
        }
        
        if (this._gangState == 0) {
            this.enterGangState(1, mjid);
        }
    },
    
    //出牌
    shoot:function(mjId){
        if(mjId == null){
            return;
        }
        
        var net = cc.vv.net;

        if (this._mingState == 1) {
            this.enterMingState(2, mjId);
        } else {
            if (this.hasOptions()) {
                net.send("guo");
            }

            this.showTings(false);

            net.send('chupai', mjId);
        }
    },

    getMJIndex: function(side, index) {
        if (side == "east") {
            return 12 - index;
        }

        return index;
    },
    
    showMopai:function(seatIndex, pai) {
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);

        var mopai = this._mopais[localIndex];
        
        var back = mopai.back;
        var table = mopai.table;
        var mj = table.getComponent("SmartMJ");

        if (pai == null) {
            back.active = false;
            table.active = false;
        }
        else if (pai >= 0) {
            back.active = false;
            table.active = true;
            mj.setFunction(1);
            mj.setMJID(pai);
        }
        else if (pai != null) {
            back.active = true;
            table.active = false;
        }
    },
    
    initEmptySprites:function(seatIndex) {
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = cc.find("layout/holds", sideChild);

        for(var i = 0; i < holds.childrenCount; ++i){
            var nc = holds.children[i].getComponent("SmartMJ");
            
            if (nc != null) {
                nc.setFunction(0);
            }
        }
    },
    
    initOtherMahjongs:function(seatData, reset) {
        var localIndex = this.getLocalIndex(seatData.seatindex);
        if (localIndex == 0) {
            return;
        }

        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = cc.find("layout/holds", sideRoot);
        var layout = sideHolds.getComponent(cc.Layout);
        
        var num = seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length;
        num *= 3;
        for (var i = 0; i < num; ++i) {
            var idx = this.getMJIndex(side, i);

            var nc = sideHolds.children[idx];
            
            nc.active = false;
        }

        var holds = this.sortHolds(seatData);
        if (holds != null && holds.length > 0) {
            if (layout) {
                layout.spacingY = -14;
            }
    
            var kou = seatData.kou;
            var index = num;
            var _holds = holds.slice(0);
    
            for (var i = 0; i < kou.length; i++) {
                var pai = kou[i];
                
                for (var j = 0; j < 3; j++) {
                    var idx = this.getMJIndex(side, index);
                    var nc = sideHolds.children[idx];
                    var mj = nc.getComponent("SmartMJ");

                    nc.active = true;
                    
                    if (reset) {
                        mj.reset();
                    }
                    
                    mj.setFunction(2);
                    
                    index++;
                    
                    var off = _holds.indexOf(pai);
                    if (off == -1) {
                        console.log("not found " + pai);
                    } else {
                        _holds.splice(off, 1);
                    }
                }
            }
    
            var max = _holds.length + index > 13 ? _holds.length - 1 : _holds.length;

            for (var i = 0; i < max; ++i) {
                var idx = this.getMJIndex(side, index);
                var nc = sideHolds.children[idx];
                var mj = nc.getComponent("SmartMJ");

                nc.active = true;

                if (reset) {
                    mj.reset();
                }

                mj.setFunction(1);
                mj.setMJID(_holds[i]);
                
                index++;
            }
        } else {
            if (layout) {
                layout.spacingY = -2;
            }
            
            for (var i = num; i < 13; i++) {
                var idx = this.getMJIndex(side, i);
                var nc = sideHolds.children[idx];
                var mj = nc.getComponent("SmartMJ");
                
                nc.active = true;

                if (reset) {
                    mj.reset();
                }

                mj.setFunction(0);
            }
        }
        
        sideHolds.height = 1300;
    },
    
    sortHolds:function(seatData) {
        var holds = seatData.holds;
        if(holds == null){
            return null;
        }
        //如果手上的牌的数目是2,5,8,11,14，表示最后一张牌是刚摸到的牌
        var mopai = null;
        var l = holds.length 
        if( l == 2 || l == 5 || l == 8 || l == 11 || l == 14){
            mopai = holds.pop();
        }

        cc.vv.mahjongmgr.sortMJ(holds);
        
        //将摸牌添加到最后
        if(mopai != null){
            holds.push(mopai);
        }

        return holds;
    },
    
    initMahjongs:function(reset) {
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);
        if (holds == null) {
            return;
        }

        var show = (seatData.hasmingpai || seatData.hued || cc.vv.replayMgr.isReplay());
        var kou = seatData.kou;
        var kouMap = {};
        
        for (var i = 0; i < kou.length; i++) {
            kouMap[kou[i]] = 3;
        }
        
        //初始化手牌
        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length)*3;

        var _holds = cc.find("game/south/layout/holds", this.node);
        var layout = _holds.getComponent(cc.Layout);

        for (var i = 0; i < holds.length; ++i) {
            var mjid = holds[i];
            var mj = this._myMJArr[i + lackingNum];
            
            if (!mj) {
                console.log("mj null: " + i + "/" + lackingNum);
            }
            
            if (reset) {
                mj.reset();
            }

            mj.node.y = 0;

            mj.node.active = true;

            var toSet = show ? 1 : 0;

            mj.setFunction(toSet);

            mj.setMJID(mjid);

            if (seatData.hasmingpai && kouMap[mjid] && kouMap[mjid] > 0) {
                mj.setKou(true);
                kouMap[mjid]--;
            } else {
                mj.setKou(false);
            }

            //console.log("mj " + (i + lackingNum) + " active: " + mjid);
        }

        for (var i = 0; i < lackingNum; ++i) {
            var mj = this._myMJArr[i];
            mj.node.active = false;
        }

        for (var i = lackingNum + holds.length; i < this._myMJArr.length; ++i) {
            var mj = this._myMJArr[i];
            mj.node.active = false;
        }
        
        //layout.spacingX = -2;
        _holds.width = 1300;
    },
    
    //如果玩家手上还有缺的牌没有打，则只能打缺牌
    checkQueYiMen:function(){
        if(cc.vv.gameNetMgr.conf==null || cc.vv.gameNetMgr.conf.type != "xlch" || !cc.vv.gameNetMgr.getSelfData().hued){
/*
            //遍历检查看是否有未打缺的牌 如果有，则需要将不是定缺的牌设置为不可用
            var dingque = cc.vv.gameNetMgr.dingque;
    //        console.log(dingque)
            var hasQue = false;
            if(cc.vv.gameNetMgr.seatIndex == cc.vv.gameNetMgr.turn){
                for(var i = 0; i < this._myMJArr.length; ++i){
                    var sprite = this._myMJArr[i];
    //                console.log("sprite.node.mjId:" + sprite.node.mjId);
                    if(sprite.node.mjId != null){
                        var type = cc.vv.mahjongmgr.getMahjongType(sprite.node.mjId);
                        if(type == dingque){
                            hasQue = true;
                            break;
                        }
                    }
                }            
            }

    //        console.log("hasQue:" + hasQue);
            for(var i = 0; i < this._myMJArr.length; ++i){
                var sprite = this._myMJArr[i];
                if(sprite.node.mjId != null){
                    var type = cc.vv.mahjongmgr.getMahjongType(sprite.node.mjId);
                    if(hasQue && type != dingque){
                        sprite.node.getComponent(cc.Button).interactable = false;
                    }
                    else{
                        sprite.node.getComponent(cc.Button).interactable = true;
                    }
                }
            }   
*/
            for(var i = 0; i < 14; ++i){
                    var sprite = this._myMJArr[i]; 
                    if(sprite.node.active == true){
                        sprite.node.getComponent(cc.Button).interactable = true;
                    }
                }
        }
        else{
            if(cc.vv.gameNetMgr.seatIndex == cc.vv.gameNetMgr.turn){
                for(var i = 0; i < 14; ++i){
                    var sprite = this._myMJArr[i]; 
                    if(sprite.node.active == true){
                        sprite.node.getComponent(cc.Button).interactable = i == 13;
                    }
                }
            }
            else{
                for(var i = 0; i < 14; ++i){
                    var sprite = this._myMJArr[i]; 
                    if(sprite.node.active == true){
                        sprite.node.getComponent(cc.Button).interactable = true;
                    }
                }
            }
        }
    },
    
    checkChuPai: function(check) {
        var gameNetMgr = cc.vv.gameNetMgr;
        var seats = gameNetMgr.seats;
        var seatData = seats[gameNetMgr.seatIndex];
        var holds = seatData.holds;
		var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length)*3;
		var hasmingpai = seatData.hasmingpai;

		if (check) {
	        // 如果已经明牌了 ，只能打摸到的
	        if (hasmingpai) {
	            for (var i = 0; i < 14; ++i) {
	                var mj = this._myMJArr[i];
	                if (mj.node.active) {
	                    mj.setInteractable(i == 13);
	                }
	            }
	        } else {
	        	var chupais = gameNetMgr.getChuPaiList();
	            for (var i = 0; i < holds.length; ++i) {
	                var mjid = holds[i];
	                var mj = this._myMJArr[i + lackingNum];

					var can = chupais.length == 0 || chupais.indexOf(mjid) >= 0;
	                mj.setInteractable(can);
	            }
	        }
		} else {
			for (var i = 0; i < holds.length; ++i) {
	                var mjid = holds[i];
	                var mj = this._myMJArr[i + lackingNum];

	                mj.setInteractable(!hasmingpai);
	            }
		}
    },
    
    checkGangPai: function() {
        var mjs = this._myMJArr;
        var options = this._optionsData;
        var gp = options.gangpai;
        
        for (var i = 0; i < mjs.length; i++) {
            var mj = mjs[i];
            if (!mj.node.active) {
                continue;
            }
            
            var mjid = mj.mjid;
            
            var gang = (gp.indexOf(mjid) != -1);

            mj.setInteractable(gang);
        }
    },
    
    checkMingPai: function() {
        var mjs = this._myMJArr;
        var options = this._optionsData;
        var mings = options.mings;
        var kou = options.kou;
        var kouMap = {};
        
        for (var i = 0; i < kou.length; i++) {
            kouMap[kou[i]] = 3;
        }
        
        for (var i = 0; i < mjs.length; i++) {
            var mj = mjs[i];
            if (!mj.node.active) {
                continue;
            }
            
            var mjid = mj.mjid;

            if (kouMap[mjid] && kouMap[mjid] > 0) {
                mj.setKou(true);
                mj.setInteractable(false);
                mj.setTing(false);
                kouMap[mjid] --;
            } else {
                var ming = (mings.indexOf(mjid) != -1);
                mj.setInteractable(ming);
                mj.setTing(ming);
                mj.setKou(false);
            }
        }
    },
    
    checkKouPai: function(check) {
        var options = this._optionsData;
        var kou = options.kou;
        var canKou = options.canKou;
        var mings = options.mings;
        var mjs = this._myMJArr;
        var kouMap = {};
        if (check) {
	        for (var i = 0; i < kou.length; i++) {
	            kouMap[kou[i]] = 3;
	        }

	        for (var i = 0; i < mjs.length; i++) {
	            var mj = mjs[i];
	            if (!mj.node.active) {
	                continue;
	            }
	            
	            var mjid = mj.mjid;
	            
	            var ming = (mings.indexOf(mjid) != -1);
	            
	            if (kouMap[mjid] && kouMap[mjid] > 0) {
	                mj.setKou(true);
	                mj.setInteractable(true);
	                mj.setTing(false);
	                kouMap[mjid] --;
	            } else if (canKou && canKou.indexOf(mjid) != -1) {
	                mj.setKou(false);
	                mj.setInteractable(true);
	                mj.setTing(ming);
	            } else {
	                mj.setKou(false);
	                mj.setInteractable(false);
	                mj.setTing(ming);
	            }
	        }
        } else {
			for (var i = 0; i < mjs.length; i++) {
	            var mj = mjs[i];
	            if (!mj.node.active) {
	                continue;
	            }

				mj.setKou(false);
			}
        }
    },

    showTings: function(enable) {
        var mjs = this._myMJArr;
        
        for (var i = 0; i < mjs.length; i++) {
            var mj = mjs[i];
            if (!mj.node.active) {
                continue;
            }
            
            var ting = enable && (this._optionsData.mings.indexOf(mj.mjid) != -1);

            mj.setTing(ting);
        }
    },

    getLocalIndex: function(index) {
        return cc.vv.gameNetMgr.getLocalIndex(index);
    },
    
    onOptionClicked: function(event) {
        var target = event.target;
        var spriteMgr = target.getComponent("SpriteMgr");
        
        var index = spriteMgr.index;
        var net = cc.vv.net;
        
        switch (index) {
            case 0:
                net.send("peng");
                break;
            case 1:
            {
                this.enterGangState(0);
                break;
            }
            case 2:
                net.send("hu");
                break;
            case 3:
                this.hideOptions();
                this.enterMingState(0);
                break;
            case 4:
                net.send("guo");
                break;
            default:
                break;
        }
    },

    enterGangState: function(state, pai) {
        this._gangState = state;
        
        var options = this._optionsData;
        var gp = options.gangpai;
        var net = cc.vv.net;

        switch (state) {
            case 0:
                if (gp.length == 1) {
                    this.enterGangState(1, gp[0]);
                } else {
                    this.showGangOpt(true);
                    this.checkGangPai();
                }

                break;
            case 1:
                net.send("gang", pai);
                this.enterGangState(-1);
                break;
            case -1:
                this.showGangOpt(false);
                this.checkChuPai(false);
                break;
            default:
                break;
        }
    },
    
    enterMingState: function(state, pai) {
        this._mingState = state;
        
        var options = this._optionsData;
        var net = cc.vv.net;
        var mgr = cc.vv.mahjongmgr;

        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = seatData.holds;

        console.log("mingState " + state);

        switch (state) {
            case 0: // koupai
            {
                var kou = [];
                options.kou = kou;
                options.mings = options.mingpai.slice(0);
                
                var canKou = mgr.checkKouPai(holds, kou);
                
                options.canKou = canKou;

                if (canKou && canKou.length > 0) {
                    this.showKouOpt(true);
                    this.checkKouPai(true);
                } else {
                    this.enterMingState(1);
                }

                break;
            }
            case 1: // chupai
            {
                this.showKouOpt(false);
                this.showMingOpt(true);
                this.checkMingPai();
                
                break;
            }
            case 2:
            {
                this.showMingOpt(false);
                this.hideMingpai(0);
                net.send("ming", { pai: pai, kou: options.kou });
                this.enterMingState(-1);
                break;
            }
            case -1: // leave
            {
                this.showMingOpt(false);
                this.showKouOpt(false);
                this.showTings(false);
                this.checkChuPai(true);
                this.hideMingpai(0);
                this._optionsData = null;
                break;
            }
            default:
            {
                break;
            }
        }
    },
    
    onMingCancelClicked: function() {
    	this.checkKouPai(false);
        this.enterMingState(-1);
        cc.vv.net.send("guo");
    },
    
    onKouFinishClicked: function() {
        this.enterMingState(1);
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
    },
    
    onDestroy:function(){
        console.log("onDestroy");
        if(cc.vv){
            cc.vv.gameNetMgr.clear();   
        }
    }
});
