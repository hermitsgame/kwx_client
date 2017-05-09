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
        _isShow: false,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return null;
        }

        cc.vv.wc = this;
        this.node.active = this._isShow;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        //var target = this.node.getChildByName('circle');
        //target.rotation = (target.rotation + dt * 360) % 360;

        var progress = this.node.getChildByName('progress');

        if (!progress.active) {
            return;
        }

        var t = Math.floor(Date.now() / 1000) % 4;

        for (var i = 0; i < progress.childrenCount; i++) {
            var p = progress.children[i];
            p.active = (i < t);
        }
    },
    
    show: function(noticeID) {
        this._isShow = true;

        if (this.node) {
            this.node.active = true;
        }

        var notice = this.node.getChildByName('notice');
        var progress = this.node.getChildByName('progress');
        var spriteMgr = notice.getComponent('SpriteMgr');

        var showNotice = (typeof(noticeID) != 'string' && noticeID >= 0);

        notice.active = showNotice;
        progress.active = showNotice;

        if (showNotice) {
            var offset = [ 90, 240, 140 ];

            progress.x = offset[noticeID];
            spriteMgr.setIndex(noticeID);
        }
    },

    hide:function() {
        this._isShow = false;

        if (this.node) {
            this.node.active = false;
        }
    }
});
