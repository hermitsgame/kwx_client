
cc.Class({
    extends: cc.Component,

    properties: {
		_idx: '',
		_lblID: null,		
    },

    // use this for initialization
    onLoad: function() {
        this.lblID = cc.find('panel/display/number', this.node).getComponent(cc.Label);
    },

    onEnable: function() {
        this.reset();
    },

	reset: function() {
		this._idx = '';
		this.lblID.string = this._idx;
    },

    onInput: function(num) {
        cc.vv.audioMgr.playButtonClicked();

		if (this._idx.length < 12) {
			this._idx += num;
			this.lblID.string = this._idx;
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

    onOkClicked: function() {
        cc.vv.audioMgr.playButtonClicked();

        // TODO
    },

    onDelClicked: function() {
        cc.vv.audioMgr.playButtonClicked();

		var id = this._idx;
		var len = id.length;

		if (len > 0) {
			this._idx = id.substring(0, len - 1);
			this.lblID.string = this._idx;
		}
    },

    onCloseClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.node, 'panel', false);
    },
});

