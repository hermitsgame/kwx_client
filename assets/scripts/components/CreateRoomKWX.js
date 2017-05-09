cc.Class({
    extends: cc.Component,

    properties: {
        _wanfa: null,
        _maxfan: null,
        _gamenum: null,
        _piao: null,
        _idx: 0,
    },

    // use this for initialization
    onLoad: function () {
        this._wanfa = [];
        var t = cc.find("body/grpWanfa", this.node);
        for (var i = 0; i < t.childrenCount; i++) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                this._wanfa.push(n);
            }
        }

        this._maxfan = [];
        var t = cc.find("body/grpMaxFan", this.node);
        for (var i = 0; i < t.childrenCount; i++) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                this._maxfan.push(n);
            }
        }

        this._gamenum = [];
        var t = cc.find("body/grpGameNum", this.node);
        for (var i = 0; i < t.childrenCount; i++) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                this._gamenum.push(n);
            }
        }

        this._piao = [];
        var t = cc.find("body/grpPiao", this.node);
        for (var i = 0; i < t.childrenCount; i++) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                this._piao.push(n);
            }
        }

		var self = this;

		this.wanfas = [ 'XY', 'XG', 'SZ', 'SY', 'YC' ];
		this.showWanfa(this._idx);

		this.node.on("rb-updated", function(event) {
            var id = event.detail.id;
            self.showWanfa(id);
        });
	},

	showWanfa: function(id) {
		var wanfas = this.wanfas;

		if (id == null || id < 0 || id >= wanfas.length) {
			return;
		}

		this._idx = id;

		var w = cc.find('body/wanfa', this.node);

		for (var i = 0; i < w.childrenCount; i++) {
			var child = w.children[i];
			child.active = i == id;
		}

		var games = [ '襄阳8番封顶', '孝感8番封顶，亮倒16番封顶', '随州8番封顶', '十堰8番封顶', '宜城8番封顶' ];

		var game = cc.find('body/grpMaxFan/btnGame/Label', this.node).getComponent(cc.Label);
		game.string = games[id];
	},

    onBtnBack:function() {
        cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.node, 'body', false);
    },

    onBtnOK:function() {
        cc.vv.audioMgr.playButtonClicked();
        cc.vv.utils.showDialog(this.node, 'body', false);
        this.createRoom();
    },

    createRoom: function() {
        var self = this;
        var onCreate = function(ret) {
            if(ret.errcode !== 0){
                cc.vv.wc.hide();
                //console.log(ret.errmsg);
                if(ret.errcode == 2222){
                    cc.vv.alert.show("房卡不足，创建房间失败!");  
                }
                else{
                    cc.vv.alert.show("创建房间失败,错误码:" + ret.errcode);
                }
            }
            else{
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };
        
        var difen = 0;

        var type = 0;
        var wanfas = [ "xykwx", "xgkwx", "szkwx", "sykwx", "yckwx" ];
        var wanfa = null;
        for (var i = 0; i < self._wanfa.length; ++i) {
            if (self._wanfa[i].checked) {
                type = i;
                wanfa = wanfas[i];
                break;
            }
        }

        var maxfan = 0;

        var gamenum = 0;
        for (var i = 0; i < self._gamenum.length; ++i) {
            if (self._gamenum[i].checked) {
                gamenum = i;
                break;
            }
        }

        var dingpiao = 0;
        for (var i = 0; i < self._piao.length; ++i) {
            if (self._piao[i].checked) {
                dingpiao = i;
                break;
            }
        }
        
        var conf = {
            type: wanfa,
            difen: difen,
            maxfan: maxfan,
            gamenum: gamenum,
            dingpiao: dingpiao > 0 ? true : false,
        };

		var id = this._idx;
		var w = cc.find('body/wanfa', this.node);
		var node = w.children[id];

		var maima = 0;
		var t = node.getChildByName('grpMaima');
		for (var i = 0; i < t.childrenCount; i++) {
			var n = t.children[i].getComponent("RadioButton");
			if (n.checked) {
				maima = (1 << i);
				break;
			}
		}

		conf.maima = maima;

		if (0 == id) {
			var pindao = 0;
			var t = node.getChildByName('grpPinDao');
			for (var i = 0; i < t.childrenCount; i++) {
				var n = t.children[i].getComponent("RadioButton");
				if (n.checked) {
					pindao = i;
					break;
				}
			}

			conf.pindao = pindao;
		} else if (1 == id) {
			var t = node.getChildByName('chkShuKan').getComponent("CheckBox");
			var shukan = t.checked;

			var t = node.getChildByName('chkMing').getComponent("CheckBox");
			var chkming = t.checked;

			conf.shukan = shukan;
			conf.chkming = chkming;
		} else if (2 == id) {
			var t = node.getChildByName('chkPartMing').getComponent("CheckBox");
			var partming = t.checked;

			conf.partming = partming;
		} else if (3 == id) {
			var pindao = 0;
			var t = node.getChildByName('grpPinDao');
			for (var i = 0; i < t.childrenCount; i++) {
				var n = t.children[i].getComponent("RadioButton");
				if (n.checked) {
					pindao = i;
					break;
				}
			}

			var t = node.getChildByName('chkUp').getComponent("CheckBox");
			var up = t.checked;

			var t = node.getChildByName('chkChaJiao').getComponent("CheckBox");
			var chajiao = t.checked;

			conf.pindao = pindao;
			conf.up = up;
			conf.chajiao = chajiao;
		} else if (4 == id) {
			conf.pqmb = true;
		}
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            conf:JSON.stringify(conf)
        };

        console.log(data);
        cc.vv.wc.show(2);
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);   
    }
});

