
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
		var shop = this.node.getChildByName('shop');
		shop.active = false;
	
		var btnBuy = cc.find('bottom_right/btn_buy', this.node);
		cc.vv.utils.addClickEvent(btnBuy, this.node, 'Shop', 'onBtnShopClicked');

		var btnAddGems = cc.find('top_left/gemsinfo/bg/btnAddGems', this.node);
		cc.vv.utils.addClickEvent(btnAddGems, this.node, 'Shop', 'onBtnShopClicked');

		var btnBack = cc.find('head/btnBack', shop);
		cc.vv.utils.addClickEvent(btnBack, this.node, 'Shop', 'onBtnBackClicked');

		var goods = cc.find('body/goods', shop);
		for (var i = 0; i < goods.childrenCount; i++) {
			var good = goods.children[i];
			cc.vv.utils.addClickEvent(good, this.node, 'Shop', 'onBtnGoodsClicked');
		}
    },

	onBtnGoodsClicked: function(event) {
		console.log('onBtnGoodsClicked');

		var info = event.target.goodsInfo;

		
    },

	onBtnShopClicked: function(event) {
		var self = this;
		var shop = this.node.getChildByName('shop');

		cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showFrame(shop, 'head', 'body', true);

		cc.vv.userMgr.getGameGoods(function(data) {
			var goods = cc.find('body/goods', shop);

			if (!data) {
				return;
			}

			for (var i = 0; i < data.length && i < goods.childrenCount; i++) {
				var good = goods.children[i];
				var info = data[i];

				var price = cc.find('bgMoney/price', good).getComponent(cc.Label);
				var number = cc.find('cardNum', good).getComponent(cc.Label);

				price.string = '￥' + info.goods_price;
				number.string = info.goods_num + '张';

				good.goodsInfo = info;
			}
		});
    },

	onBtnBackClicked: function(event) {
		var shop = this.node.getChildByName('shop');

		cc.vv.audioMgr.playButtonClicked();
	    cc.vv.utils.showFrame(shop, 'head', 'body', false);
    },
});

