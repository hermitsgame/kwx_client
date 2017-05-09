
cc.Class({
    extends: cc.Component,

    properties: {
        index: 0,
        
        mjid: -1,
        
        _total: 0,
        
        _ting: false,
        _kou: false,
        _interactable: true,
    },

    onLoad: function() {
        this.initView();
    },
    
    initView: function() {
        var cnt = this.node.childrenCount;

        for (var i = 0; i < cnt; i++) {
            var child = this.node.children[i];
            child.active = (i == this.index);
        }
        
        this._total = cnt;
    },
    
    getMJ: function() {
        var child =  this.node.children[this.index];

        if (child) {
            return child.getComponent("Majiang");
        } else {
            return null;
        }
    },
    
    setFunction: function(idx) {
        var cnt = this.node.childrenCount;

		for (var i = 0; i < cnt; i++) {
            var child = this.node.children[i];
			var enable = (i == idx);

            child.active = enable;

			if (enable) {
				this.node.height = child.height;
            	this.node.width = child.width;
			}
        }

        this.index = idx;
        
        this.refresh();
    },
    
    refresh: function() {
        var mj = this.getMJ();
        if (mj) {
            mj.setMJID(this.mjid);
            mj.setKou(this._kou);
            mj.setTing(this._ting);
            mj.setInteractable(this._interactable);
            mj.refresh();
        }
    },
    
    reset: function() {
        this.index = 0;
        this.mjid = -1;
        this._ting = false;
        this._kou = false,
        this._interactable = true;
        
        this.refresh();
    },
    
    setTing: function(status) {
        var mj = this.getMJ();

        if (mj) {
            mj.setTing(status);
        }
        
        this._ting = status;
    },
    
    setKou: function(status) {
        var mj = this.getMJ();
        if (mj) {
            mj.setKou(status);
        }
        
        this._kou = status;
    },
    
    setInteractable: function(status) {
        var mj = this.getMJ();
        if (mj) {
            mj.setInteractable(status);
        }
        
        var button = this.node.getComponent(cc.Button);
        if (button) {
            button.interactable = status;
        }

        this._interactable = status;
    },

	getInteractable: function() {
		return this._interactable;
    },

    setMJID: function(mjid) {
        var mj = this.getMJ();
        
        if (mj) {
            mj.setMJID(mjid);
        }
        
        this.mjid = mjid;
    }
});
