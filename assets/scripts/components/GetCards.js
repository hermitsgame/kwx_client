
cc.Class({
    extends: cc.Component,

    properties: {
		_noHistory: null,
		_itemTemp: null,
    },

    onLoad: function() {
		var root = this.node.getChildByName('getCards');
		root.active = false;

		var btnGetCards = cc.find('top_left/btnGetGems', this.node);
		cc.vv.utils.addClickEvent(btnGetCards, this.node, 'GetCards', 'onBtnGetCardsClicked');

		var btnClose = cc.find('body/btnClose', root);
		cc.vv.utils.addClickEvent(btnClose, this.node, 'GetCards', 'onBtnCloseClicked');

		var body = root.getChildByName('body');
		var self = this;

		self.initShare();
		self.initGet();

		root.on('rb-updated', function(event) {
			var id = event.detail.id;
			self.chooseTag(id);
		});
	},

	chooseTag: function(id) {
		var body = cc.find('getCards/body', this.node);
		var children = ['share', 'get'];

		for (var i = 0; i < children.length; i++) {
			var node = body.getChildByName(children[i]);

			node.active = (id == i);
		}
	},

	initShare: function() {
		var share = cc.find('getCards/body/share', this.node);
		var inviteNum = share.getChildByName('lblInviteNum').getComponent(cc.Label);
		var btnWechat = share.getChildByName('btnWechat');
		var btnTimeline = share.getChildByName('btnTimeline');
		var btnBind = share.getChildByName('btnBind');
		var uid = cc.vv.userMgr.userId;

		inviteNum.string = uid.toString(16).toUpperCase();

		cc.vv.utils.addClickEvent(btnWechat, this.node, 'GetCards', 'onBtnShareWechat');
		cc.vv.utils.addClickEvent(btnTimeline, this.node, 'GetCards', 'onBtnShareTimeline');
		cc.vv.utils.addClickEvent(btnBind, this.node, 'GetCards', 'onBtnBind');
	},

	initGet: function() {
		var get = cc.find('getCards/body/get', this.node);
		var content = cc.find('scroll/view/content', get);
		var btnGet = cc.find('available/btnGet', content);

		cc.vv.utils.addClickEvent(btnGet, this.node, 'GetCards', 'onBtnGet');

		var list = cc.find('friends/list', content);
		this._noHistory = list.children[0];
		this._itemTemp = list.children[1];

		list.removeAllChildren();
	},

	updateData: function() {
		var share = cc.find('getCards/body/share', this.node);
		var btnBind = share.getChildByName('btnBind').getComponent(cc.Button);
		var get = cc.find('getCards/body/get', this.node);
		var content = cc.find('scroll/view/content', get);
		var btnGet = cc.find('available/btnGet', content).getComponent(cc.Button);
		var list = cc.find('friends/list', content);
		var lblAlready = cc.find('already/lblNum', content).getComponent(cc.Label);
		var lblAvailable = cc.find('available/lblNum', content).getComponent(cc.Label);
		var lblMax = cc.find('friends/lblNum', content).getComponent(cc.Label);
		var self = this;

		lblMax.string = '300';

		cc.vv.userMgr.getBindInfo(function(data) {
			lblAlready.string = data.total + '张';
			lblAvailable.string = data.avail;
			btnGet.interactable = data.avail > 0;
			btnBind.interactable = data.bid == 0;

			var binds = data.binds;

			list.removeAllChildren();

			if (binds.length == 0) {
				list.addChild(cc.instantiate(self._noHistory));
			} else {
				for (var i = 0; i < binds.length; i++) {
					var bind = binds[i];
					var item = cc.instantiate(self._itemTemp);
					var lblDate = item.getChildByName('lblDate').getComponent(cc.Label);
					var lblName = item.getChildByName('lblName').getComponent(cc.Label);
					var lblFinished = item.getChildByName('lblFinished').getComponent(cc.Label);
					var spriteMgr = item.getComponent('SpriteMgr');

					lblDate.string = self.dateFormat(bind.time * 1000);
					lblName.string = bind.name;
					lblFinished.string = bind.fr ? '是' : '否';

					spriteMgr.setIndex(i % 2);

					list.addChild(item);
				}
			}
        });
	},

	dateFormat: function(time) {
		var date = new Date(time);
		var datetime = "{0}-{1}-{2}";
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();

		month = month >= 10 ? month : ('0' + month);        
        day = day >= 10 ? day : ('0' + day);
		datetime = datetime.format(year, month, day);

        return datetime;
	},

	onBtnShareWechat: function() {

	},

	onBtnShareTimeline: function() {

	},

	onBtnBind: function() {
		var share = cc.find('getCards/body/share', this.node);
		var btnBind = share.getChildByName('btnBind');
		var edtInvite = share.getChildByName('edtInvite').getComponent(cc.EditBox);
		var bid = edtInvite.string;

		if (bid == '') {
			cc.vv.alert.show('邀请码不能为空!');
			return;
		}

		var bind_id = parseInt(bid, 16);
		var self = this;

		cc.vv.userMgr.bind(bind_id, function(data) {
			if (!data) {
				cc.vv.alert.show('绑定失败！');
			} else {
				cc.vv.alert.show('绑定成功！');
				self.updateData();
			}
		});
	},

	onBtnGet: function() {
		var self = this;

		cc.vv.userMgr.getAwards(function(data) {
			if (data) {
				self.updateData();

				var hall = self.node.getComponent('Hall');
				console.log('refreshInfo');
				hall.refreshInfo();
			}
		});
	},

	onBtnGetCardsClicked: function() {
		var root = this.node.getChildByName('getCards');

		cc.vv.audioMgr.playButtonClicked();
	    cc.vv.utils.showFrame(root, 'head', 'body', true);

		this.updateData();
	},

	onBtnCloseClicked: function() {
		var root = this.node.getChildByName('getCards');

		cc.vv.audioMgr.playButtonClicked();
	    cc.vv.utils.showFrame(root, 'head', 'body', false);
	},

});

