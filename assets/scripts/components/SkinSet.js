cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _mjStyle: [],
        _bgStyle: [],
        _mjIndex: 0,
        _bgIndex: 0,
    },

    // use this for initialization
    onLoad: function () {
    	var body = this.node.getChildByName('body');
        var mjStyle = body.getChildByName('mjStyle');

        var mgr = cc.vv.mahjongmgr;
        this._mjIndex = mgr.getMJStyle();
        this._bgIndex = mgr.getBGStyle();

        for (var i = 0; i < mjStyle.childrenCount; i++) {
            var mj = mjStyle.children[i];

            cc.vv.utils.addClickEvent(mj, this.node, 'SkinSet', 'onMjBtnClicked', '' + i);

            var tag = mj.getChildByName('select');
            tag.active = (this._mjIndex == i);

            this._mjStyle.push(tag);
        }

        var bgStyle = body.getChildByName('bgStyle');
        
        for (var i = 0; i < bgStyle.childrenCount; i++) {
            var bg = bgStyle.children[i];

            cc.vv.utils.addClickEvent(bg, this.node, 'SkinSet', 'onBgBtnClicked', '' + i);

            var tag = bg.getChildByName('select');
            tag.active = (this._bgIndex == i);

            this._bgStyle.push(tag);
        }

		var btnClose = cc.find('body/btnClose', this.node);
		cc.vv.utils.addClickEvent(btnClose, this.node, 'SkinSet', 'onCloseClicked');
    },


    onMjBtnClicked: function(event, data) {
        var id = parseInt(data);
        var mgr = cc.vv.mahjongmgr;

        var old = this._mjIndex;

		cc.vv.audioMgr.playButtonClicked();

        if (id != old) {
            this._mjStyle[old].active = false;
            this._mjStyle[id].active = true;

            mgr.setMJStyle(id);

            this._mjIndex = id;
        }
    },

    onBgBtnClicked: function(event, data) {
        var id = parseInt(data);
        var mgr = cc.vv.mahjongmgr;
        var old = this._bgIndex;

		cc.vv.audioMgr.playButtonClicked();

        if (id != old) {
            this._bgStyle[old].active = false;
            this._bgStyle[id].active = true;

            mgr.setBGStyle(id);

            this._bgIndex = id;
        }
    },

	onCloseClicked: function() {
		cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.node, 'body', false);
    },
});

