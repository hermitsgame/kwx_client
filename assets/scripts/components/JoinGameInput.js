cc.Class({
    extends: cc.Component,

    properties: {
        // 0 - 5
        inputs: {
            default: [],
            type: [cc.Label],
        },
        
        _roomid: [],
        
        _inputIndex: 0,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    onEnable:function(){
        this.onResetClicked();
    },
    
    onInputFinished: function(roomId) {
        cc.vv.userMgr.enterRoom(roomId, function(ret) {
            if (ret.errcode == 0) {
                this.node.active = false;
            }
            else {
                var content = "房间["+ roomId +"]不存在，请重新输入!";
                if(ret.errcode == 4){
                    content = "房间["+ roomId + "]已满!";
                }
                cc.vv.alert.show(content);
                this.onResetClicked();
            }
        }.bind(this)); 
    },
    
    onInput: function(num) {
        cc.vv.audioMgr.playButtonClicked();

        var id = this._inputIndex;
        if (id >= this.inputs.length) {
            return;
        }

        this.inputs[id].string = num;
        this._inputIndex = id + 1;
        this._roomid.push(num);

        if (this._inputIndex == this.inputs.length) {
            var roomId = this.parseRoomID();
            this.onInputFinished(roomId);
        }
    },
    
    onN0Clicked: function() {
        this.onInput(0);
    },
    onN1Clicked:function(){
        this.onInput(1);  
    },
    onN2Clicked:function(){
        this.onInput(2);
    },
    onN3Clicked:function(){
        this.onInput(3);
    },
    onN4Clicked:function(){
        this.onInput(4);
    },
    onN5Clicked:function(){
        this.onInput(5);
    },
    onN6Clicked:function(){
        this.onInput(6);
    },
    onN7Clicked:function(){
        this.onInput(7);
    },
    onN8Clicked:function(){
        this.onInput(8);
    },
    onN9Clicked:function(){
        this.onInput(9);
    },

    onResetClicked: function() {
        cc.vv.audioMgr.playButtonClicked();

        for (var i = 0; i < this.inputs.length; ++i) {
            this.inputs[i].string = '';
        }
        this._inputIndex = 0;
        this._roomid = [];
    },

    onDelClicked: function() {
        cc.vv.audioMgr.playButtonClicked();

        if (this._inputIndex > 0) {
            this._inputIndex -= 1;
            this.inputs[this._inputIndex].string = '';
            this._roomid.pop();
        }
    },

    onCloseClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.node, 'panel', false);
    },
    
    parseRoomID: function() {
        var str = "";
        for (var i = 0; i < this.inputs.length; ++i) {
            str += this._roomid[i];
        }
        return str;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
