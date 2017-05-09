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
        target:cc.Node,
        sprite:cc.SpriteFrame,
        checkedSprite:cc.SpriteFrame,
        checked:false,
    },

    // use this for initialization
    onLoad: function() {
        this.refresh();
    },
    
    onClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
        this.checked = !this.checked;
        this.refresh();
    },

    refresh: function() {
        var targetSprite = this.target.getComponent(cc.Sprite);
		var label = this.target.getChildByName("Label");
        if (this.checked) {
            targetSprite.spriteFrame = this.checkedSprite;
			if (label != null) {
                label.color = new cc.Color(146, 50, 50, 255);
            }
        } else {
            targetSprite.spriteFrame = this.sprite;
			if (label != null) {
                label.color = new cc.Color(5, 116, 102, 255);
            }
        }
    }
});

