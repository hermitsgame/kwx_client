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
        groupId:-1,
        
        notify: {
            default: null,
            type: cc.Node,
        },
        
        index: -1,
        
        type: 0,
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }

        if (cc.vv.radiogroupmgr == null) {
            var RadioGroupMgr = require("RadioGroupMgr");
            cc.vv.radiogroupmgr = new RadioGroupMgr();
            cc.vv.radiogroupmgr.init();
        }

		//console.log(typeof(cc.vv.radiogroupmgr.add));
        cc.vv.radiogroupmgr.add(this);

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
    },
    
    check: function(value) {
        this.checked = value;
        this.refresh();
        
        if (value && this.notify) {
            this.notify.emit("rb-updated", { id: this.index });
        }
    },
    
    onClicked:function() {
        cc.vv.audioMgr.playButtonClicked();

        if (this.type > 0 && this.checked) {
            this.check(false);
        } else {
            cc.vv.radiogroupmgr.check(this);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    onDestroy:function(){
        if(cc.vv && cc.vv.radiogroupmgr){
            cc.vv.radiogroupmgr.del(this);            
        }
    }
});
