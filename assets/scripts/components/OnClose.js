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
        target: {
            default: null,
            type: cc.Node,
        }
    },

    // use this for initialization
    onLoad: function() {
        if (this.target) {
            cc.vv.utils.addClickEvent(this.target, this.node, "OnClose", "onBtnClicked");
        }
    },
    
    onBtnClicked: function(event) {
        this.node.active = false;
    },
});
