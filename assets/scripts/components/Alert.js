cc.Class({
    extends: cc.Component,

    properties: {
        _alert:null,
        _btnOK:null,
        _btnCancel:null,
        //_title:null,
        _content:null,
        _onok:null,
    },

    // use this for initialization
    onLoad: function() {
        if (cc.vv == null) {
            return;
        }

		var alert = cc.find("Canvas/alert");
        this._alert = alert;

        this._content = cc.find("body/content", alert).getComponent(cc.Label);
        this._btnOK = cc.find("body/btn_ok", alert);
        this._btnCancel = cc.find("body/btn_cancel", alert);

        cc.vv.utils.addClickEvent(this._btnOK, this.node, "Alert", "onBtnClicked");
        cc.vv.utils.addClickEvent(this._btnCancel, this.node, "Alert", "onBtnClicked");

        this._alert.active = false;
        cc.vv.alert = this;
    },

    onBtnClicked: function(event) {
        cc.vv.audioMgr.playSFX('Sound/Alert_Close.mp3');

        if (event.target.name == "btn_ok") {
            if(this._onok){
                this._onok();
            }
        }

        this._onok = null;
		cc.vv.utils.showDialog(this._alert, 'body', false);
    },

    show: function(content, onok, needcancel) {
        cc.vv.audioMgr.playSFX('Sound/Alert_Open.mp3');

        this._alert.active = true;
        this._onok = onok;
        this._content.string = content;
        if (needcancel) {
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        } else {
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }

		cc.vv.utils.showDialog(this._alert, 'body', true);
    },

    onDestory:function() {
        if (cc.vv) {
            cc.vv.alert = null;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
