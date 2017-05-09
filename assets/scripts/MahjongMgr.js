
var mahjongSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {
        eastAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        
        westAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        
        southAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        
        _sides: null,
    },
    
    onLoad: function() {
        if (cc.vv == null) {
            return;
        }

		cc.vv.mahjongmgr = this;
        this._sides = ["south", "east", "west"];
    },
    
    setMJStyle: function(style) {
        var old = this.getMJStyle();
        
        if (old != style) {
            cc.sys.localStorage.setItem('mj_style', style);

            cc.vv.gameNetMgr.refreshMJ();
        }
    },

    getMJStyle: function() {
    	var style = 0;
        var t = cc.sys.localStorage.getItem('mj_style');
		if (t != null) {
			style = parseInt(t);
		}

		return style;
    },

    setBGStyle: function(style) {
        var old = this.getBGStyle();
        
        if (old != style) {
            cc.sys.localStorage.setItem('bg_style', style);

            cc.vv.gameNetMgr.refreshBG(style);
        }
    },
    
    getBGStyle: function() {
    	var style = 0;
		var t = cc.sys.localStorage.getItem('bg_style');
		if (t != null) {
			style = parseInt(t);
		}

		return style;
    },

    getMahjongType:function(id){
      if(id >= 0 && id < 9){
          return 0;
      }
      else if(id >= 9 && id < 18){
          return 1;
      }
      else if(id >= 18 && id < 27){
          return 2;
      }
      else {
          return 3;
      }
    },

	getAudioContentByMJID: function(id) {
		var content = '';

		if (id >= 0 && id < 9) {
			id++;
			content = 'tong_' + id;
		} else if (id >= 9 && id < 18) {
			id = id - 8;
			content = 'tiao_' + id;
		} else {
			switch (id) {
				case 27:
					content = 'zhong';
					break;
				case 28:
					content = 'fa';
					break;
				case 29:
					content = 'bai';
					break;
				default:
					break;
			}
		}

		return content;
    },

    sortMJ: function(mahjongs) {
        var self = this;
        mahjongs.sort(function(a, b) {
            return a - b;
        });
    },

    getSide: function(localIndex) {
        return this._sides[localIndex];
    },

    getSpriteFrame: function(direction, name) {
    	var sprite = null;

        if (direction == "south") {
            sprite = this.southAtlas.getSpriteFrame(name);
        } else if (direction == "east") {
            sprite = this.eastAtlas.getSpriteFrame(name);
        } else if (direction == "west") {
            sprite = this.westAtlas.getSpriteFrame(name);
        }

		return sprite;
    },
    
    getTileSpriteFrame: function(direction, location, mjid) {
        var id = this.getResourceMJID(mjid);
        
        var name = direction + "_" + location + "_tile_"+ id;

        return this.getSpriteFrame(direction, name);
    },
    
    getBoardSpriteFrame: function(direction, location) {
        var name = direction + "_" + location + "_board_" + this.getMJStyle();

        return this.getSpriteFrame(direction, name);
    },
    
    getAnySpriteFrame: function(direction, name) {
        var path = direction + "_" + name + "_" + this.getMJStyle();

        return this.getSpriteFrame(direction, path);
    },
    
    getResourceMJID: function(id) {
        var resourceId = 0;
        
        if (id >= 0 && id < 9) {
            resourceId = id + 21;
        }
        else if (id >= 9 && id < 18) {
            resourceId = id + 2;
        } else {
            switch (id) {
                case 27:
                    resourceId = 35;
                    break;
                case 28:
                    resourceId = 36;
                    break;
                case 29:
                    resourceId = 37;
                    break;
            }
        }

        return resourceId;
    },
    
	getTings: function(holds, kou, mjid) {
		var countMap = {};

		for (var i = 0; i < holds.length; i++) {
			var pai = holds[i];
			var c = countMap[pai];
			if (c == null) {
				c = 0;
			}

			countMap[pai] = c + 1;
		}

		for (var i = 0; i < kou.length; i++) {
			var pai = kou[i];

			var c = countMap[pai];

			if (!c || c < 3) {
				console.log("error: kou not found - " + pai);
				return [];
			} else {
				c = c - 3;
			}

			countMap[pai] = c;
		}

		var c = countMap[mjid];
		if (!c || c < 1) {
			console.log("error: mj not found - " + mjid);
			return [];
		} else {
			c = c - 1;
		}

		countMap[mjid] = c;

		var tings = this.checkCanTingPai(holds, countMap);

		return tings;
	},

	checkCanTingPai: function(holds, countMap) {
		var tingMap = {};

		if (holds.length >= 13) {
			var hu = false;
			var danPai = -1;
			var pairCount = 0;

			for (var k in countMap) {
				var c = countMap[k];
				if (c == 2 || c == 3) {
					pairCount++;
				} else if (c == 4) {
					pairCount += 2;
				}

				if (c == 1 || c == 3) {
					//如果已经有单牌了，表示不止一张单牌，直接闪
					if (danPai >= 0) {
						break;
					}

					danPai = k;
				}
			}

			//检查是否有6对 并且单牌是不是目标牌
			if (pairCount == 6) {
				//七对只能和一张，就是手上那张单牌
				tingMap[danPai] = {
					pattern: "7pairs",
					fan: 2,
				};
			}
		}

		var singleCount = 0;
		var colCount = 0;
		var pairCount = 0;
		var arr = [];

		for (var k in countMap) {
			var c = countMap[k];
			if (c == 1) {
				singleCount++;
				arr.push(k);
			} else if(c == 2) {
				pairCount++;
				arr.push(k);
			} else if(c == 3) {
				colCount++;
			} else if(c == 4) {
				singleCount++;
				pairCount+=2;
			}
		}

		if ((pairCount == 2 && singleCount == 0) || (pairCount == 0 && singleCount == 1)) {
			for (var i = 0; i < arr.length; ++ i) {
				//对对胡1番
				var p = arr[i];
				if (tingMap[p] == null) {
					tingMap[p] = {
						pattern:"duidui",
						fan: 1,
					};
				}
			}
		}

		this.checkTingPai(holds, countMap, tingMap, 0, 9);
		this.checkTingPai(holds, countMap, tingMap, 9, 18);
		this.checkTingPai(holds, countMap, tingMap, 27, 30);

		var tings = [];
		for (var k in tingMap) {
			var c = parseInt(k);
			tings.push(c);
		}

		return tings;
	},

	getMings: function(holds, kou) {
		var countMap = {};

		for (var i = 0; i < holds.length; i++) {
			var pai = holds[i];
			var c = countMap[pai];
			if (c == null) {
				c = 0;
			}

			countMap[pai] = c + 1;
		}

		for (var i = 0; i < kou.length; i++) {
			var pai = kou[i];

			var c = countMap[pai];

			if (!c || c < 3) {
				console.log("error kou: " + pai);
				return [];
			} else {
				c = c - 3;
			}

			countMap[pai] = c;
		}

		return this.getMingPai(holds, countMap);
	},

	getMingPai: function(holds, countMap) {
		var mings = [];

		for (var k in countMap) {
			var c = countMap[k];
			if (0 == c) {
				continue;
			}

			countMap[k]--;

			var tings = this.checkCanTingPai(holds, countMap);
			if (tings && tings.length > 0) {
				var pai = parseInt(k);
				if (cc.vv.gameNetMgr.checkCanChuPai(pai)) {
    				mings.push(pai);
				}
			}

			countMap[k] = c;
		}

		return mings;
	},

	checkKouPai: function(holds, kou) {
		var canKou = [];
		var countMap = {};

		for (var i = 0; i < holds.length; i++) {
			var pai = holds[i];
			var c = countMap[pai];
			if (c == null) {
				c = 0;
			}

			countMap[pai] = c + 1;
		}

		for (var i = 0; i < kou.length; i++) {
			var pai = kou[i];

			var c = countMap[pai];

			if (!c || c < 3) {
				console.log("error kou " + pai);
				return [];
			} else {
				c = c - 3;
			}

			countMap[pai] = c;
		}

		for (var k in countMap) {
			var old = countMap[k];
			var c = old;
			if (old >= 3) {
				c = c - 3;
			} else {
				continue;
			}

			countMap[k] = c;

			var mings = this.getMingPai(holds, countMap);
			if (mings && mings.length > 0) {
				var pai = parseInt(k);
				canKou.push(pai);
			}

			countMap[k] = old;
		}

		return canKou;
	},

	checkTingPai: function(holds, countMap, tingMap, begin, end) {
		for (var i = begin; i < end; ++i) {
			if (tingMap[i] != null) {
				continue;
			}

			var old = countMap[i];
			if (old == null) {
				old = 0;
				countMap[i] = 1;
			} else {
				countMap[i] ++;
			}

			holds.push(i);

			var ret = this.checkCanHu(holds, countMap);
			if (ret) {
				tingMap[i] = {
					pattern: "normal",
					fan: 0,
				};
			}

			countMap[i] = old;
			holds.pop();
		}
	},

	matchSingle: function(holds, countMap, selected) {
		if (selected >= 27) {
			return false;
		}

		//分开匹配 A-2,A-1,A
		var matched = true;
		var v = selected % 9;
		if (v < 2) {
			matched = false;
		} else {
			for (var i = 0; i < 3; ++i) {
				var t = selected - 2 + i;
				var cc = countMap[t];
				if (!cc || cc == 0) {
					matched = false;
					break;
				}
			}
		}

		//匹配成功，扣除相应数值
		if (matched) {
			countMap[selected - 2] --;
			countMap[selected - 1] --;
			countMap[selected] --;
			var ret = this.checkSingle(holds, countMap);
			countMap[selected - 2] ++;
			countMap[selected - 1] ++;
			countMap[selected] ++;
			if (ret) {
				return true;
			}
		}

		//分开匹配 A-1,A,A + 1
		matched = true;
		if (v < 1 || v > 7) {
			matched = false;
		} else {
			for (var i = 0; i < 3; ++i) {
				var t = selected - 1 + i;
				var cc = countMap[t];
				if (!cc || cc == 0) {
					matched = false;
					break;
				}
			}
		}

		//匹配成功，扣除相应数值
		if (matched) {
			countMap[selected - 1] --;
			countMap[selected] --;
			countMap[selected + 1] --;
			var ret = this.checkSingle(holds, countMap);
			countMap[selected - 1] ++;
			countMap[selected] ++;
			countMap[selected + 1] ++;
			if (ret) {
				return true;
			}
		}


		//分开匹配 A,A+1,A + 2
		matched = true;
		if (v > 6) {
			matched = false;
		} else {
			for (var i = 0; i < 3; ++i) {
				var t = selected + i;
				var cc = countMap[t];
				if (!cc || cc == 0) {
					matched = false;
					break;
				}
			}
		}

		//匹配成功，扣除相应数值
		if (matched) {
			countMap[selected] --;
			countMap[selected + 1] --;
			countMap[selected + 2] --;
			var ret = this.checkSingle(holds, countMap);
			countMap[selected] ++;
			countMap[selected + 1] ++;
			countMap[selected + 2] ++;
			if (ret) {
				return true;
			}
		}

		return false;
	},

	checkSingle: function(holds, countMap) {
		var selected = -1;
		var c = 0;
		for (var i = 0; i < holds.length; ++i) {
			var pai = holds[i];
			c = countMap[pai];
			if (c && c != 0) {
				selected = pai;
				break;
			}
		}

		//如果没有找到剩余牌，则表示匹配成功了
		if (selected == -1) {
			return true;
		}

		//否则，进行匹配
		if (c == 3) {
			countMap[selected] = 0;
			var ret = this.checkSingle(holds, countMap);
			//立即恢复对数据的修改
			countMap[selected] = c;
			if (ret) {
				return true;
			}
		} else if (c == 4) {
			countMap[selected] = 1;
			var ret = this.checkSingle(holds, countMap);
			//立即恢复对数据的修改
			countMap[selected] = c;
			//如果作为一坎能够把牌匹配完，直接返回TRUE。
			if (ret) {
				return true;
			}
		}

		//按单牌处理
		return this.matchSingle(holds, countMap, selected);
	},

	checkCanHu: function(holds, countMap) {
		for (var k in countMap) {
			k = parseInt(k);
			var c = countMap[k];
			if (c < 2) {
				continue;
			}

			//如果当前牌大于等于２，则将它选为将牌
			countMap[k] -= 2;
			//逐个判定剩下的牌是否满足　３Ｎ规则,一个牌会有以下几种情况
			//1、0张，则不做任何处理
			//2、2张，则只可能是与其它牌形成匹配关系
			//3、3张，则可能是单张形成 A-2,A-1,A  A-1,A,A+1  A,A+1,A+2，也可能是直接成为一坎
			//4、4张，则只可能是一坎+单张
			var ret = this.checkSingle(holds, countMap);
			countMap[k] += 2;
			if (ret) {
				return true;
			}
		}
	},
});

