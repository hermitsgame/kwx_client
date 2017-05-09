cc.Class({
    extends: cc.Component,

    properties: {
        sprites: {
            default: [],
            type: [cc.SpriteFrame]
        },

        index: -1,
    },

    onLoad: function() {
        this.setIndex(this.index);
    },
    
    setIndex: function(index) {
        var target = this.node.getComponent(cc.Sprite);

        if (index == -1) {
            target.spriteFrame = null;
        } else if (this.sprites[index] != null) {
            target.spriteFrame = this.sprites[index];
        }
        
        this.index = index;
    },
    
    // called every frame, uncomment this function to activate update callback
//    update: function (dt) {
//    },
});
