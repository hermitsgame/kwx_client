
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
        _templates: [],
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.vv){
            return;
        }
        
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName("south");
        var pengangroot = cc.find("layout/penggangs", myself);
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        
        //pengangroot.scaleX *= scale;
        //pengangroot.scaleY *= scale;
        
        var sides = [ "south", "east", "west" ];
        for (var i = 0; i < sides.length; i++) {
            var side = gameChild.getChildByName(sides[i]);
            var peng = cc.find("layout/penggangs", side);
            var child = peng.children[0];

            this._templates.push(child);
            peng.removeChild(child);
        }
        
        var self = this;
        this.node.on('peng_notify',function(data){
            //刷新所有的牌
            //console.log(data.detail);
            var data = data.detail;
            self.onPengGangChanged(data);
        });
        
        this.node.on('gang_notify',function(data){
            //刷新所有的牌
            //console.log(data.detail);
            var data = data.detail;
            self.onPengGangChanged(data.seatData);
        });
        
        this.node.on('game_begin', function(data) {
            self.onGameBein();
        });

		this.node.on('game_sync', function(data) {
            self.onGameBein();
			var seats = cc.vv.gameNetMgr.seats;

        	for (var i in seats) {
            	self.onPengGangChanged(seats[i]);
        	}
        });
        
        var seats = cc.vv.gameNetMgr.seats;
        for (var i in seats) {
            this.onPengGangChanged(seats[i]);
        }
    },
    
    onGameBein:function(){
        this.hideSide("south");
        this.hideSide("west");
        this.hideSide("east");
    },
    
    getPengGangItem:function(root, side, index) {
        if (root.childrenCount > index) {
            return root.children[index];
        }

        var sides = [ "south", "east", "west" ];
        var id = sides.indexOf(side);

        var node = cc.instantiate(this._templates[id]);
        root.addChild(node);
        return node;
    },
    
    hideSide:function(side){
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = cc.find("layout/penggangs", myself);
        if (pengangroot) {
            pengangroot.removeAllChildren();
        }
        
        if (side == "south") {
            pengangroot.width = 0;
        } else {
            pengangroot.height = 0;
        }
    },
    
    onPengGangChanged:function(seatData) {
        
        if (seatData.angangs == null &&
            seatData.diangangs == null &&
            seatData.wangangs == null &&
            seatData.pengs == null)
        {
            return;
        }

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
       
		//console.log("onPengGangChanged" + localIndex);
            
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = cc.find("layout/penggangs", myself);

        for (var i = 0; i < pengangroot.childrenCount; i++) {
            pengangroot.children[i].active = false;
        }

        //初始化杠牌
        var index = 0;
        
        var gangs = seatData.angangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initPengAndGangs(pengangroot, side, index, mjid, "angang");
            index++;
        }

        var gangs = seatData.diangangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initPengAndGangs(pengangroot, side, index, mjid, "diangang");
            index++;
        }

        var gangs = seatData.wangangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initPengAndGangs(pengangroot, side, index, mjid, "wangang");
            index++;
        }
        
        //初始化碰牌
        var pengs = seatData.pengs;
        if (pengs) {
            for (var i = 0; i < pengs.length; ++i) {
                var mjid = pengs[i];
                this.initPengAndGangs(pengangroot, side, index, mjid, "peng");
                index++;
            }
        }
    },

    initPengAndGangs:function(pengangroot, side, index, mjid, flag) {
        var pgroot = null;
        var mgr = cc.vv.mahjongmgr;

        pgroot = this.getPengGangItem(pengangroot, side, index);
        pgroot.active = true;

        for (var i = 0; i < pgroot.childrenCount; i++) {
            var child = pgroot.children[i];

            var board = child.getComponent(cc.Sprite);
            var tile = child.children[0];
			var tileSprite = tile.getComponent(cc.Sprite);

            if (child.name == "gang") {
                var isGang = flag != "peng";
                child.active = isGang;
                
                if (!isGang) {
                    continue;
                }

                if (flag == "angang") {
                    board.spriteFrame = mgr.getBoardSpriteFrame(side, "meld_cover");
                    tile.active = false;
                } else {
                    board.spriteFrame = mgr.getBoardSpriteFrame(side, "meld");
                    
                    var sprite = mgr.getTileSpriteFrame(side, "meld", mjid);
                    if (!sprite) {
                        sprite = mgr.getTileSpriteFrame(side, "table", mjid);
                    }

					tile.active = true;
                    tileSprite.spriteFrame = sprite;
                }
            } else {
				board.spriteFrame = mgr.getBoardSpriteFrame(side, "meld");

				var sprite = mgr.getTileSpriteFrame(side, "meld", mjid);
				if (!sprite) {
					sprite = mgr.getTileSpriteFrame(side, "table", mjid);
				}

				tile.active = true;
				tileSprite.spriteFrame = sprite;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
