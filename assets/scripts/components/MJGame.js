

cc.Class({
    extends: cc.Component,

    properties: {        
        gameRoot:{
            default:null,
            type:cc.Node
        },
        
        prepareRoot: {
            default: null,
            type: cc.Node   
        },

        _options: null,
        _optionsData: null,

        _selectedMJ: null,
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
        
        _bgMgr: null,
        _maima: null,
        
        _acting: 0,
        _gameover: null,

		_tempHolds: [],
		_tempPrompt: null,
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

		cc.vv.audioMgr.playBackGround();
    },
    
    initView: function() {
        var gameChild = this.node.getChildByName("game");

        this._mjcount = cc.find("mj_count/mj_count", gameChild).getComponent(cc.Label);
        this._mjcount.string = cc.vv.gameNetMgr.numOfMJ;
        this._gamecount = cc.find("Canvas/infobar/room/game_count").getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + " / " + cc.vv.gameNetMgr.maxNumOfGames;

        var south = gameChild.getChildByName("south");
        var layout = south.getChildByName("layout");

        var realwidth = cc.director.getVisibleSize().width;
        var realheight = cc.director.getVisibleSize().height;

        layout.scaleX *= realwidth/1280;
        layout.scaleY *= realwidth/1280;

        var sides = ["south", "east", "west"];
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
            this._chupais.push(sideChild.getChildByName("chupai"));
/*
            var mopai = sideChild.getChildByName("mopai");
            if (mopai) {
                var mopai2 = cc.find("layout/mopai", sideChild);
                var data = { back: mopai.children[0], table: mopai2 };
                
                this._mopais.push(data);
            } else {
                this._mopais.push(null);
            }
*/
			var holds = [];
			var _holds = cc.find("layout/holds", sideChild);

			while (_holds.childrenCount > 0) {
				var mj = _holds.children[0];

				holds.push(mj);
				_holds.removeChild(mj);
			}

			this._tempHolds[i] = holds;
        }

        var opts = gameChild.getChildByName("options");
        this._options = opts;
        this.hideOptions();
        this.hideChupai();
        //this.hideMopai();
        
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

		var prompts = gameChild.getChildByName("prompts");
		this._tempPrompt = prompts.children[0];
		prompts.removeAllChildren();
		prompts.active = false;
    },

	showTingPrompts: function(tings) {
		var prompts = cc.find('game/prompts', this.node);

		if (!tings || tings.length == 0) {
			prompts.active = false;
			return;
		}

		var len = tings.length;
		var temp = this._tempPrompt;

		while (prompts.childrenCount > len) {
			var child = prompts.children[len];
			prompts.removeChild(child);
		}

		prompts.active = true;

		for (var i = 0; i < len; i++) {
			var prompt = null;
			if (prompts.childrenCount > i) {
				prompt = prompts.children[i];
			} else {
				prompt = cc.instantiate(temp);
				prompts.addChild(prompt);
			}

			var ting = tings[i];

			var mj = prompt.getChildByName('south_hand').getComponent('Majiang');
			var info = prompt.getChildByName('info').getComponent(cc.Label);
			var hu = prompt.getChildByName('hu').getComponent(cc.Label);

			mj.setMJID(ting.pai);

			info.string = '剩' + ting.left + '张 ' + ting.fan + '番';
			hu.string = ting.pattern;
		}
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
/*
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
*/
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

        var self = this;
        
        this.node.on('game_holds', function(data) {
           self.initMahjongs();
           self.checkChuPai(true);
        });
        
        this.node.on('game_begin', function(data) {
            self.onGameBegin();
        });
        
        this.node.on('game_sync', function(data) {
            self.onGameBegin();
        });
        
        this.node.on('game_chupai', function(data) {
            data = data.detail;
            self.hideChupai();
/*
            if (data.last != cc.vv.gameNetMgr.seatIndex) {
                self.showMopai(data.last, null);
            }
*/
        });
        
        this.node.on('game_mopai',function(data) {
            self.hideChupai();
            data = data.detail;
			self.showMopai(data.seatIndex, data.pai);

			var localIndex = cc.vv.gameNetMgr.getLocalIndex(data.seatIndex);
			if (0 == localIndex) {
				self.checkChuPai(true);
			}
        });
        
        this.node.on('game_action',function(data){
            self.showAction(data.detail);
        });
        
        this.node.on('hupai',function(data) {
            var data = data.detail;
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
			var pai = data.detail.pai;

            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                //self.initMahjongs();
				self.doChupai(seatData, pai);
				self.checkChuPai(false);
            }
            else {
				self.doChupai(seatData, pai);
                //self.initOtherMahjongs(seatData);
            }

            //self.hideMopai();
            self.showChupai();
            var content = cc.vv.mahjongmgr.getAudioContentByMJID(data.detail.pai);
            cc.vv.audioMgr.playCard(content);
        });
        
        this.node.on('guo_notify',function(data){
            self.hideChupai();
            self.hideOptions();
            var seatData = data.detail;

            //if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
            //    self.initMahjongs();                
            //}
        });
        
        this.node.on('guo_result',function(data) {
            self.hideOptions();
        });

        this.node.on('peng_notify', function(data) {
            self.hideChupai();
            
            var seatData = data.detail.seatData;
			var pai = data.detail.pai;
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
				self.checkChuPai(true);
				self.showTings(false);
            }
            else {
                self.initOtherMahjongs(seatData, false, true);
            }

            var localIndex = self.getLocalIndex(seatData.seatindex);

            self.playEfx(localIndex, 'peng');
			cc.vv.audioMgr.playAction('peng');

            self.hideOptions();
        });

        this.node.on('ming_notify', function(data) {
            var seatData = data.detail;
            
            if(seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                //self.initMahjongs();
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

        this.node.on('gang_notify',function(info) {
            self.hideChupai();
            var data = info.detail;
            var seatData = data.seatData;
            var gangtype = data.gangtype;
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
				self.checkChuPai(false);
				self.showTings(false);
            } else {
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
        });

        this.node.on("hangang_notify",function(data){
            var data = data.detail;
            var localIndex = self.getLocalIndex(data);
            self.hideOptions();
        });

        this.node.on('refresh_mj', function() {
            self.refreshMJ();
        });

        this.node.on('refresh_bg', function(data) {
            self._bgMgr.setIndex(data.detail);
        });

		var fnTouchStart = function(event) {
			var target = event.target;
			var mj = target.getComponent('SmartMJ');
			
			if (mj && !mj.getInteractable()) {
				return;
			}

			target.moved = false;
			self.southMJClicked(event);

			console.log('touch start');
		};

		var fnTouchEnd = function(event) {
			var selected = self._selectedMJ;
			var target = event.target;
			var mj = target.getComponent('SmartMJ');
			
			if (mj && !mj.getInteractable()) {
				return;
			}

			console.log('touch end');

			if (selected && selected == target) {
				var touches = event.getTouches();
				var position = target.parent.convertTouchToNodeSpaceAR(touches[0]);
				var s = target.getContentSize();
				var rect = cc.rect(target.oldx - s.width / 2, target.oldy - s.height / 2, s.width, s.height);

				if (cc.rectContainsPoint(rect, position)) {
					if (target.moved) {
						target.x = target.oldx;
						target.y = target.oldy;
						self._selectedMJ = null;
						self.showTingPrompts();
					} else {
						target.x = target.oldx;
						target.y = target.oldy + 15;
					}
				} else {
					self.shoot(target);
					self._selectedMJ = null;
					self.showTingPrompts();
					return;
				}
			}
		};

		var fnTouchMove = function(event) {
			var selected = self._selectedMJ;
			var target = event.getCurrentTarget();
			var mj = target.getComponent('SmartMJ');
			
			if (mj && !mj.getInteractable()) {
				return;
			}

			if (selected && selected == target) {
				var touches = event.getTouches();
				var position = target.parent.convertTouchToNodeSpaceAR(touches[0]);
				var s = target.getContentSize();
				var rect = cc.rect(target.oldx - s.width / 2, target.oldy - s.height / 2, s.width, s.height);

				target.setPosition(position);

				if (!cc.rectContainsPoint(rect, position)) {
					target.moved = true;
				}
			}
		};

		var fnTouchCancel = function(event) {
			console.log('touch cancel');
		};

		var holds = this._tempHolds[0];
		for (var i = 0; i < holds.length; i++) {
			var mjnode = holds[i];

			mjnode.on(cc.Node.EventType.TOUCH_START, fnTouchStart);
			mjnode.on(cc.Node.EventType.TOUCH_END, fnTouchEnd);
			mjnode.on(cc.Node.EventType.TOUCH_MOVE, fnTouchMove);
			mjnode.on(cc.Node.EventType.TOUCH_CANCEL, fnTouchCancel);
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

		var playActions = function(hu) { 
			var index = hu.index;
			var acts = hu.actions;

			if (!acts || acts.length == 0) {
				fnCB();

				return;
			}

			var act = acts.pop();
			var data = hu;

			console.log('playing ' + act + '@' + index);

			if (hu.hued) {
				self.playEfx(index, act);
				cc.vv.audioMgr.playHu(act, function() {
					setTimeout(function() {
						playActions(data);
					}, 500);
				});
			} else {
				self.playEfx(index, act, function() {
					setTimeout(function() {
						playActions(data);
					}, 500);
				});
			}
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

			playActions(hu);
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
            var mj = chupai.getChildByName('south_table').getComponent('Majiang');
            mj.refresh();
        }

		var prompts = cc.find('game/prompts', this.node);
		for (var i = 0; i < prompts.childrenCount; i++) {
			var prompt = prompts.children[i];
			var mj = prompt.getChildByName('south_hand').getComponent('Majiang');
            mj.refresh();
		}

		this._tempPrompt.getChildByName('south_hand').getComponent('Majiang').refresh();
    },
    
    showChupai: function() {
        var pai = cc.vv.gameNetMgr.chupai; 
        if( pai >= 0 ) {
            var localIndex = this.getLocalIndex(cc.vv.gameNetMgr.turn);
            var chupai = this._chupais[localIndex];
			var mj = chupai.getChildByName('south_table').getComponent('Majiang');

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
/*
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
*/

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

	onMJClicked: function(event) {
		var target = event.target;
		console.log('clicked: ' + target);
    },

    southMJClicked: function(event) {
        if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
            console.log("not your turn." + cc.vv.gameNetMgr.turn);
            return;
        }

		var target = event.target;
		var holds = cc.find("game/south/layout/holds", this.node);

        for (var i = 0; i < holds.childrenCount; i++) {
            var mjnode = holds.children[i];
			var mj = mjnode.getComponent('SmartMJ');

            if (target == mjnode) {
                if (this._mingState == 0 || this._gangState == 0) {
                    if (this._selectedMJ != null) {
                        this._selectedMJ.y = 0;
                    }

                    this.onMJChoosed(mj);
                    return;
                } else {
                    if (target == this._selectedMJ) {
                        this.shoot(target); 
                        this._selectedMJ.y = 0;
                        this._selectedMJ = null;
						this.showTingPrompts();
                        return;
                    }

                    if(this._selectedMJ != null){
                        this._selectedMJ.y = 0;
                    }

					target.oldx = target.x;
					target.oldy = target.y;

                    //target.y = 15;
                    this._selectedMJ = target;
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
            
            options.canKou = mgr.checkKouPai(seatData, kou);
            options.mings = mgr.getMings(seatData, kou);

            this.checkKouPai(true);
            console.log(options.kou);
            console.log(options.mings);
            this.showTings(true);
        } else if (this._mingState == 1) {
            var tings = mgr.getTings(seatData, options.kou, mjid);
            this.showTingPrompts(tings);
		} else if (this._gangState == 0) {
            this.enterGangState(1, mjid);
        } else {
        	if (options) {
				var tings = mgr.getTings(seatData, null, mjid);
				this.showTingPrompts(tings);
        	}
        }
    },

    shoot: function(mjnode) {
        if (mjnode == null) {
            return;
        }
        
        var net = cc.vv.net;
		var mj = mjnode.getComponent('SmartMJ');
		var mjid = mj.mjid;

		this._lastChupai = mjnode;

        if (this._mingState == 1) {
            this.enterMingState(2, mjid);
        } else {
            if (this.hasOptions()) {
                net.send("guo");
            }

            this.showTings(false);

            net.send('chupai', mjid);
        }

		this._optionsData = null;
    },

    getMJIndex: function(side, index) {
        if (side == "east") {
            return 12 - index;
        }

        return index;
    },

    checkChuPai: function(check) {
        var gameNetMgr = cc.vv.gameNetMgr;
        var seats = gameNetMgr.seats;
        var seatData = seats[gameNetMgr.seatIndex];
		var hasmingpai = seatData.hasmingpai;

		var holds = cc.find("game/south/layout/holds", this.node);
		var mjcnt = holds.childrenCount;

		if (check) {
	        if (hasmingpai) {
	            for (var i = 0; i < mjcnt; ++i) {
					var mjnode = holds.children[i];
	                var mj = mjnode.getComponent('SmartMJ');

	                if (mjnode.active) {
	                    mj.setInteractable((i == mjcnt - 1) && (mjcnt % 3 == 2));
	                }
	            }
	        } else {
	        	var chupais = gameNetMgr.getChuPaiList();
	            for (var i = 0; i < mjcnt; ++i) {
					var mjnode = holds.children[i];
	                var mj = mjnode.getComponent('SmartMJ');
					var mjid = mj.mjid;

					var can = chupais.length == 0 || chupais.indexOf(mjid) >= 0;
	                mj.setInteractable(can);
	            }
	        }
		} else {
			for (var i = 0; i < mjcnt; ++i) {
	                var mjnode = holds.children[i];
	                var mj = mjnode.getComponent('SmartMJ');

	                mj.setInteractable(!hasmingpai);
	            }
		}
    },
    
    checkGangPai: function() {
        var holds = cc.find("game/south/layout/holds", this.node);
		var mjcnt = holds.childrenCount;
        var options = this._optionsData;
        var gp = options.gangpai;
        
        for (var i = 0; i < mjcnt; i++) {
            var mjnode = holds.children[i];
			var mj = mjnode.getComponent('SmartMJ');

            if (!mjnode.active) {
                continue;
            }
            
            var mjid = mj.mjid;
            
            var gang = (gp.indexOf(mjid) != -1);

            mj.setInteractable(gang);
        }
    },
    
    checkMingPai: function() {
        var holds = cc.find("game/south/layout/holds", this.node);
		var mjcnt = holds.childrenCount;
        var options = this._optionsData;
        var mings = options.mings;
        var kou = options.kou;
        var kouMap = {};
        
        for (var i = 0; i < kou.length; i++) {
            kouMap[kou[i]] = 3;
        }
        
        for (var i = 0; i < mjcnt; i++) {
            var mjnode = holds.children[i];
			var mj = mjnode.getComponent('SmartMJ');

            if (!mjnode.active) {
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
        var holds = cc.find("game/south/layout/holds", this.node);
		var mjcnt = holds.childrenCount;
        var kouMap = {};

        if (check) {
	        for (var i = 0; i < kou.length; i++) {
	            kouMap[kou[i]] = 3;
	        }

	        for (var i = 0; i < mjcnt; i++) {
	            var mjnode = holds.children[i];
				var mj = mjnode.getComponent('SmartMJ');

	            if (!mjnode.active) {
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
			for (var i = 0; i < mjcnt; i++) {
	            var mjnode = holds.children[i];
				var mj = mjnode.getComponent('SmartMJ');

	            if (!mjnode.active) {
	                continue;
	            }

				mj.setKou(false);
			}
        }
    },

    showTings: function(enable) {
        var holds = cc.find("game/south/layout/holds", this.node);
		var mjcnt = holds.childrenCount;
        
        for (var i = 0; i < mjcnt; i++) {
			var mjnode = holds.children[i];
			var mj = mjnode.getComponent('SmartMJ');

            if (!mjnode.active) {
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

		this.showTingPrompts();

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

	doMing: function(seatData) {
		var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
		var sideHolds = cc.find('game/' + side + '/layout/holds', this.node);

		for (var i = 0; i < sideHolds.childrenCount; i++) {
			var child = sideHolds.children[i];
			var mj = child.getComponent('SmartMJ');

			mj.setFunction(1);
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
                
                var canKou = mgr.checkKouPai(seatData, kou);
                
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
				this.showTingPrompts();
				this.doMing(seatData);
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
                this.showTingPrompts();
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
		this.showTings(true);
        cc.vv.net.send("guo");
    },
    
    onKouFinishClicked: function() {
        this.enterMingState(1);
    },

	getMJItem: function(root, localIndex, index) {
		if (root.childrenCount > index) {
			//console.log('getMJItem: ' + localIndex + ' ' + root.childrenCount + ' ' + this._tempHolds[localIndex].length);
            return root.children[index];
        }

        var node = this._tempHolds[localIndex].pop();
		var mj = node.getComponent('SmartMJ');

		mj.reset();
		root.addChild(node);

		//console.log('getMJItem: ' + localIndex + ' ' + root.childrenCount + ' ' + this._tempHolds[localIndex].length);
		
        return node;
    },

	putMJItem: function(root, localIndex, item) {
		root.removeChild(item, false);
		this._tempHolds[localIndex].push(item);

		//console.log('putMJItem: ' + localIndex + ' ' + root.childrenCount + ' ' + this._tempHolds[localIndex].length);
    },

	getMJPosition: function(localIndex, id) {
		var start = 0;
		var xoff = 0;
		var yoff = 0;

		if (0 == localIndex) {
			start = 43;
			xoff = 84;
		} else if (localIndex == 1) {
			start = 18.21
			yoff = 32;
		} else if (localIndex == 2) {
			start = -18.21
			yoff = -32;
		}

		if (xoff != 0) {
			var x = start + xoff * id;

			return cc.p(x, 0);
		} else if (yoff != 0) {
			var y = start + yoff * id;

			return cc.p(0, y)
		}
    },

	setMJLocation: function(mjnode, localIndex, index, board, mopai) {
		var start = 0;
		var xoff = 0;
		var yoff = 0;
		var barrier = 0;
		var id = index;

		if (localIndex == 0) {
			start = 43;
			xoff = 84;

			if (mopai) {
				barrier = 40;
			}
		} else if (localIndex == 1) {
			if (board) {
				start = 18.21
				yoff = 32;
			} else {
				start = 19;
				yoff = 36;
			}

			if (mopai) {
				barrier = 9;
			}
		} else if (localIndex == 2) {
			if (board) {
				start = -18.21
				yoff = -32;
			} else {
				start = -19;
				yoff = -36;
			}

			if (mopai) {
				barrier = -9;
			}
		}

		if (xoff != 0) {
			var x = start + xoff * id + barrier;

			mjnode.x = x;
			mjnode.y = 0;
		} else if (yoff != 0) {
			var y = start + yoff * id + barrier;

			mjnode.y = y;
			mjnode.x = 0;
		}
    },

	sortHolds:function(seatData) {
        var holds = seatData.holds;
        if(holds == null){
            return null;
        }

        var mopai = null;
        var l = holds.length 
        if( l == 2 || l == 5 || l == 8 || l == 11 || l == 14) {
            mopai = holds.pop();
        }

        cc.vv.mahjongmgr.sortMJ(holds);

        if (mopai != null) {
            holds.push(mopai);
        }

        return holds;
    },

	doChupai: function(seatData, pai) {
		var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
		var sideHolds = cc.find('game/' + side + '/layout/holds', this.node);

		var mjcnt = sideHolds.childrenCount;
		var swap = (side == 'east');
		var myself = (0 == localIndex);

		var mopaiNode = sideHolds.children[mjcnt - 1];
		var mopai = mopaiNode.getComponent('SmartMJ');
		var mopaiId = mopai.mjid;
		var folds = this.node.getComponent('Folds');

		var show = (myself || seatData.hasmingpai || seatData.hued || cc.vv.replayMgr.isReplay());

		if (!show) {
			var pos = mopaiNode.parent.convertToWorldSpaceAR(mopaiNode.position);

			folds.doChupai(seatData, pai, pos);

			this.putMJItem(sideHolds, localIndex, mopaiNode);

			console.log('doChupai 1');

			return;
		}

		var mjnode = null;

		if (myself) {
			mjnode = this._lastChupai;
		}

		this._lastChupai = null;

		mopaiNode.oldID = mjcnt - 1;

		if (mjnode == null && mopaiId == pai) {
			mjnode = mopaiNode;
		}

		for (var i = 0; i < mjcnt - 1; i++) {
			var node = sideHolds.children[i];
			var mj = node.getComponent('SmartMJ');

			node.oldID = swap ? (mjcnt - 2 - i) : i;

			if (mjnode == null && mj.mjid == pai) {
				mjnode = node;
			}
		}

		if (!mjnode) {
			console.log('mjnode not found!');
		}

		var pos = sideHolds.convertToWorldSpaceAR(mjnode.position);

		this.putMJItem(sideHolds, localIndex, mjnode);

		folds.doChupai(seatData, pai, pos);

		var holds = [];
		var insert = mopaiNode != mjnode;

		if (!insert) {
			return;
		}

		mjcnt = sideHolds.childrenCount;

		for (var i = 0; i < mjcnt - 1; i++) {
			var node = sideHolds.children[swap ? (mjcnt - 2 - i) : i];

			holds.push(node);
		}

		var min = 0;
		for (var i = 0; i < holds.length; i++) {
			var mj = holds[i].getComponent('SmartMJ');
			if (mopaiId >= mj.mjid) {
				min = i + 1;
			} else {
				break;
			}
		}

		holds.splice(min, 0, mopaiNode);

		for (var i = 0; i < holds.length; i++) {
			var node = holds[i];

			var p0 = this.getMJPosition(localIndex, i);

			node.setSiblingIndex(swap ? (mjcnt - 1 - i): i);

			if (node != mopaiNode) {
				if (i != node.oldID) {
					node.runAction(cc.moveTo(0.3, p0));
				}
			} else {
				var oldx = node.x;
				var oldy = node.y;
				var p1 = null;
				var p2 = null;

				if (0 == localIndex) {
					var newy = oldy + node.height + 10;
					p1 = cc.p(oldx, newy);
					p2 = cc.p(p0.x, newy);
				} else if (1 == localIndex) {
					var newx = oldx - node.width - 10;
					p1 = cc.p(newx, oldy);
					p2 = cc.p(newx, p0.y);
				} else if (2 == localIndex) {
					var newx = oldx + node.width + 10;
					p1 = cc.p(newx, oldy);
					p2 = cc.p(newx, p0.y);
				}

				var acts = null;

				if (i == holds.length - 1) {
					acts = cc.moveTo(0.3, p0);
				} else {
					acts = cc.sequence(cc.moveTo(0.1, p1), cc.moveTo(0.1, p2), cc.moveTo(0.1, p0));
				}

				node.runAction(acts);
			}
		}
    },

	showMopai: function(seatIndex, pai) {
		var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
		var side = cc.vv.mahjongmgr.getSide(localIndex);
		var sideHolds = cc.find('game/' + side + '/layout/holds', this.node);
		var mjcnt = sideHolds.childrenCount;
		var swap = (side == 'east');
		var myself = (0 == localIndex);
		var seatData = cc.vv.gameNetMgr.seats[seatIndex];
		var showBoard = (pai >= 0) && (seatData.hasmingpai || cc.vv.replayMgr.isReplay());
		var pgs = this.getPengGangsNum(seatData);
		var index = 13 - pgs;

		if (pai == null) {
			if (mjcnt <= index) {
				return;
			}

			var mjnode = sideHolds.children[index];

			this.putMJItem(sideHolds, localIndex, mjnode);
			return;
		}

		var mjnode = this.getMJItem(sideHolds, localIndex, index);
		var mj = mjnode.getComponent('SmartMJ');

		this.setMJLocation(mjnode, localIndex, index, showBoard, true);

		mjnode.active = true;
		mj.setFunction(showBoard ? 1 : 0);

		if (showBoard || myself) {
			mj.setMJID(pai);
			mj.setKou(false);
		}
	},

	initMahjongs: function(reset) {
        var seats = cc.vv.gameNetMgr.seats;
        var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);
        if (holds == null) {
            return;
        }

		console.log('initMahjongs');

		var _holds = holds.slice(0);

        var show = (seatData.hasmingpai || seatData.hued || cc.vv.replayMgr.isReplay());
        var kou = seatData.kou;
        var kouMap = {};

        for (var i = 0; i < kou.length; i++) {
            kouMap[kou[i]] = 3;
        }

        var sideHolds = cc.find("game/south/layout/holds", this.node);
		var total = _holds.length;

		while (sideHolds.childrenCount > total) {
			var mjnode = sideHolds.children[total];

			this.putMJItem(sideHolds, 0, mjnode);
		}

        for (var i = 0; i < total; ++i) {
            var mjid = _holds[i];
			var mjnode = this.getMJItem(sideHolds, 0, i);
			var mj = mjnode.getComponent('SmartMJ');

			this.setMJLocation(mjnode, 0, i, show, (i == total - 1) && (total % 3 == 2));

            if (reset) {
                mj.reset();
            }

            mjnode.y = 0;
            mjnode.active = true;

            var toSet = show ? 1 : 0;

            mj.setFunction(toSet);

            mj.setMJID(mjid);

            if (seatData.hasmingpai && kouMap[mjid] && kouMap[mjid] > 0) {
                mj.setKou(true);
                kouMap[mjid]--;
            } else {
                mj.setKou(false);
            }
        }

		console.log('initMahjongs end');
    },

	initOtherMahjongs: function(seatData, reset, hasMopai) {
        var localIndex = this.getLocalIndex(seatData.seatindex);
        if (localIndex == 0) {
            return;
        }

		console.log('initOtherMahjongs');

        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = cc.find("layout/holds", sideRoot);
        var holds = this.sortHolds(seatData);

        if (holds != null && holds.length > 0) {
            var kou = seatData.kou;
            var index = 0;
			var _holds = holds.slice(0);
			var mjcnt = _holds.length;
			var mopai = null;

			for (var i = 0; i < mjcnt; i++) {
				var mjnode = this.getMJItem(sideHolds, localIndex, i);
				mjnode.active = true;
			}

			while (sideHolds.childrenCount > mjcnt) {
				var mjnode = sideHolds.children[mjcnt];

				this.putMJItem(sideHolds, localIndex, mjnode);
			}

			if (mjcnt % 3 == 2) {
				mopai = _holds.pop();
				mjcnt--;
			}

            for (var i = 0; i < kou.length; i++) {
                var pai = kou[i];
                
                for (var j = 0; j < 3; j++) {
                    var idx = (side == 'east') ? (mjcnt - 1 - index) : index;
					
                    var mjnode = this.getMJItem(sideHolds, localIndex, idx);
                    var mj = mjnode.getComponent("SmartMJ");

					this.setMJLocation(mjnode, localIndex, index, true, false);

                    mjnode.active = true;
                    
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

			var total = _holds.length;
            for (var i = 0; i < total; i++) {
                var idx = (side == 'east') ? (mjcnt - 1 - index) : index;
                var mjnode = this.getMJItem(sideHolds, localIndex, idx);
                var mj = mjnode.getComponent("SmartMJ");

				this.setMJLocation(mjnode, localIndex, index, true, (i == total - 1) && (total % 3 == 2));

                mjnode.active = true;

                if (reset) {
                    mj.reset();
                }

                mj.setFunction(1);
                mj.setMJID(_holds[i]);

                index++;
            }

			if (mopai) {

				var idx = index;
				var mjnode = this.getMJItem(sideHolds, localIndex, idx);
				var mj = mjnode.getComponent("SmartMJ");

				this.setMJLocation(mjnode, localIndex, index, true, true);

				mjnode.active = true;

                if (reset) {
                    mj.reset();
                }

                mj.setFunction(1);
                mj.setMJID(mopai);

                index++;
			}
        } else {
			var penggangs = this.getPengGangsNum(seatData);
			var mjnum = 13 - penggangs;

			if (hasMopai) {
				mjnum += 1;
			}

			while (sideHolds.childrenCount > mjnum) {
				var mjnode = sideHolds.children[mjnum];

				this.putMJItem(sideHolds, localIndex, mjnode);
			}

            for (var i = 0; i < mjnum; i++) {
                var idx = i;
                var mjnode = this.getMJItem(sideHolds, localIndex, idx);
                var mj = mjnode.getComponent("SmartMJ");

				this.setMJLocation(mjnode, localIndex, idx, false, (i == mjnum - 1) && (mjnum % 3 == 2));
				
                mjnode.active = true;

                if (reset) {
                    mj.reset();
                }

                mj.setFunction(0);
            }
        }

		console.log('initOtherMahjongs end');
    },

	getPengGangsNum: function(seatData) {
		var num = seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length;
        return num * 3;
	},

    onDestroy:function(){
        console.log("onDestroy");
        if(cc.vv){
            cc.vv.gameNetMgr.clear();   
        }
    }
});

