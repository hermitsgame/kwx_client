
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
    
    getTileSpriteFrame: function(direction, name, mjid) {
        var id = this.getResourceMJID(mjid);
        
        var fullname = direction + "_" + name + "_tile_"+ id;

        return this.getSpriteFrame(direction, fullname);
    },
    
    getBoardSpriteFrame: function(direction, name) {
        var fullname = direction + "_" + name + "_board_" + this.getMJStyle();

        return this.getSpriteFrame(direction, fullname);
    },
    
    getAnySpriteFrame: function(direction, name) {
        var fullname = direction + "_" + name + "_" + this.getMJStyle();

        return this.getSpriteFrame(direction, fullname);
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

	getMJType: function(id) {
        if (id >= 0 && id < 9) {
                return 0;
        } else if (id >= 9 && id < 18) {
                return 1;
        } else if (id >= 18 && id < 27) {
                return 2;
        } else {
                return 3;
        }
	},

	isSameType: function(type, arr) {
		for (var i = 0; i < arr.length; ++i) {
			var t = this.getMJType(arr[i]);
			if (type != -1 && type != t) {
				return false;
			}

			type = t;
		}

		return true;
	},

	checkQingYiSe: function(sd) {
		var holds = sd._holds;
        var type = this.getMJType(holds[0]);

        if (this.isSameType(type, holds) &&
            this.isSameType(type, sd.angangs) &&
            this.isSameType(type, sd.wangangs) &&
            this.isSameType(type, sd.diangangs) &&
            this.isSameType(type, sd.pengs))
        {
                return true;
        }

        return false;
	},

	calcHoldMultiCardNum: function(countMap, num) {
		var cnt = 0;

		var map = countMap;
		for (var k in map) {
			k = parseInt(k);
			var c = map[k];

			if (c >= num) {
				cnt += 1;
			}
		}

		return cnt;
	},

	checkSanYuan7Pairs: function(countMap) {
        var map = countMap;

        return (map[27] && map[27] >= 2 &&
                map[28] && map[28] >= 2 &&
                map[29] && map[29] >=2);
	},

	calcCardNum: function(sd, k) {
        var cnt = 0;
		var countMap = sd.countMap;

        if (countMap[k]) {
                cnt += countMap[k];
        }

        if (sd.pengs.indexOf(k) != -1) {
                cnt += 3;
        }

        if (sd.angangs.indexOf(k) != -1) {
                cnt += 4;
        }

        if (sd.diangangs.indexOf(k) != -1) {
                cnt += 4;
        }

        if (sd.wangangs.indexOf(k) != -1) {
                cnt += 4;
        }

        return cnt;
	},

	checkDaSanYuan: function(sd) {
        var arr = [ this.calcCardNum(sd, 27),
                    this.calcCardNum(sd, 28),
                    this.calcCardNum(sd, 29) ];

        var trip = 0;
        var doub = 0;

        for (var i = 0; i < arr.length; i++) {
                if (arr[i] >= 3) {
                        trip += 1;
                } else if (arr[i] == 2) {
                        doub += 1;
                }
        }

        if (3 == trip) {
                return true;
        } else {
                return false;
        }
	},

	checkXiaoSanYuan: function(sd) {
        var arr = [ this.calcCardNum(sd, 27),
                    this.calcCardNum(sd, 28),
                    this.calcCardNum(sd, 29) ];

        var trip = 0;
        var doub = 0;

		for (var i = 0; i < arr.length; i++) {
			if (arr[i] >= 3) {
				trip += 1;
			} else if (arr[i] == 2) {
				doub += 1;
			}
		}

        if (2 == trip && doub == 1) {
			return true;
        } else {
			return false;
        }
	},

	checkKaWuXing: function(sd) {
        var holds = sd._holds;
        var map = sd.countMap;

        var pai = holds[holds.length - 1];

        if (pai != 4 && pai != 13) {
                return false;
        }

        if (!map[pai-1] || map[pai-1] < 1) {
                return false;
        }

        if (!map[pai+1] || map[pai+1] < 1) {
                return false;
        }

        map[pai-1] --;
        map[pai+1] --;
        map[pai] --;

        var ret = this.checkCanHu(holds, map);

        map[pai-1] ++;
        map[pai+1] ++;
        map[pai] ++;

        return ret;
	},

	checkMingSiGui: function(conf, sd) {
		var countMap = sd.countMap;
		var strict = !(conf.pindao == 0);
		var holds = sd._holds;

		if (!strict) {
			for (var i = 0; i < sd.pengs.length; i++) {
				var peng = sd.pengs[i];

				if (countMap[peng] == 1) {
					return true;
				}
			}
		} else {
			var pai = holds[holds.length - 1];
			for (var i = 0; i < sd.pengs.length; i++) {
				if (sd.pengs[i] == pai) {
					return true;
				}
			}
		}

        return false;
	},

	checkAnSiGui: function(conf, sd) {
		var countMap = sd.countMap;
		var strict = conf.pindao == 1 || conf.type == 'xgkwx';
		var holds = sd._holds;

		if (!strict) {
			for (var i = 0; i < holds.length; ++i) {
				var pai = holds[i];
				if (countMap[pai] == 4) {
					return true;
				}
			}

			return false;
		} else {
			var pai = holds[holds.length - 1];
			return (countMap[pai] == 4);
		}
	},

	getFan: function(sd, pai, conf) {
		var countMap = sd.countMap;
		var tingMap = sd.tingMap;
		var info = tingMap[pai];
		var holds = sd._holds;

		holds.push(pai);
		if (countMap[pai] != null) {
			countMap[pai]++;
		} else {
			countMap[pai] = 1;
		}

		var qingyise = this.checkQingYiSe(sd);
		var isJinGouHu = (holds.length == 1 || holds.length == 2);

		var fan = info.fan;

		if (qingyise) {
			fan += 2;
		}

		if (isJinGouHu) {
			fan += 2;
		}

		if (info.pattern == '7pairs') {
			var dragon = this.calcHoldMultiCardNum(countMap, 4);
			var sanyuan7pairs = this.checkSanYuan7Pairs(countMap);

			if (3 == dragon) {
				fan += 5;
			} else if (2 == dragon) {
				fan += 3;
			} else if (sanyuan7pairs) {
				fan += 3;
			} else if (1 == dragon) {
				fan += 1;
			}
		} else {
			if (this.checkDaSanYuan(sd)) {
				fan += 3;
			} else if (this.checkXiaoSanYuan(sd)) {
				fan += 2;
			}

			if (this.checkKaWuXing(sd)) {
				if (conf.type == 'sykwx') {
					fan += 2;
				} else {
					fan += 1;
				}
			}

			if (this.checkMingSiGui(conf, sd)) {
				fan += 1;
			} else if (this.checkAnSiGui(conf, sd)) {
				fan += 2;
			}
		}

		countMap[pai]--;
		holds.pop();

		return (1 << fan);
    },

	getLeft: function(pai) {
		var seats = cc.vv.gameNetMgr.seats;
		var left = 4;

		for (var i in seats) {
			var seat = seats[i];
			var holds = seat.holds;
			var folds = seat.folds;

			if (holds && holds.length > 0) {
				for (var j in holds) {
					if (holds[j] == pai) {
						left -= 1;
					}
				}
			}

			if (folds && folds.length > 0) {
				for (var j in folds) {
					if (folds[j] == pai) {
						left -= 1;
					}
				}
			}

			if (seat.pengs.indexOf(pai) != -1) {
				left -= 3;
 			} else if (seat.angangs.indexOf(pai) != -1 ||
 						seat.diangangs.indexOf(pai) != -1 ||
						seat.wangangs.indexOf(pai) != -1)
			{
				left -= 4;
			}
		}

		return left;
    },
	
	getPattern: function(pattern) {
        var patterns = [ 'normal', '7pairs', 'duidui' ];
        var hu = [ '平胡', '七对', '碰碰胡' ];
        
        var id = patterns.indexOf(pattern);
        if (id != -1) {
            return hu[id];
        }
        
        return '';
	},

	makeCountMap: function(holds) {
		var countMap = {};
	
		for (var i = 0; i < holds.length; i++) {
			var pai = holds[i];
			var c = countMap[pai];
			if (c == null) {
				c = 0;
			}

			countMap[pai] = c + 1;
		}

		return countMap;
	},
	
	getTings: function(sd, kou, mjid) {
		var holds = sd._holds = sd.holds.slice(0);
		var idx = holds.indexOf(mjid);

		if (idx == -1) {
			console.log('mj not found: ' + mjid);
			return [];
		}

		holds.splice(idx, 1);

		this.initContext(sd, kou);

		var countMap = sd.countMap;

		var tingMap = this.getTingMap(sd);

		sd.tingMap = tingMap;

		if (kou) {
			for (var i = 0; i < kou.length; i++) {
				var pai = kou[i];
				var c = countMap[pai];

				if (c == null) {
					c = 0;
				}

				c += 3;
				countMap[pai] = c;

				for (var i = 0; i < 3; i++) {
					holds.splice(0, 0, pai);
				}
			}
		}

		var tings = [];
		var conf = cc.vv.gameNetMgr.conf;

		for (var k in tingMap) {
			var c = parseInt(k);
			var fan = this.getFan(sd, c, conf);
			var left = this.getLeft(c);

			var ting = {
				pai: c,
				fan: fan,
				left: left,
				pattern: this.getPattern(tingMap[k].pattern),
			};

			tings.push(ting);
		}

		return tings;
	},

	getTingMap: function(sd) {
		var tingMap = {};
		var holds = sd._holds;
		var countMap = sd.countMap;

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
					if (danPai >= 0) {
						break;
					}

					danPai = k;
				}
			}

			if (pairCount == 6) {
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

		return tingMap;
	},

	initContext: function(sd, kou) {
		var holds = sd._holds;

		if (kou) {
			for (var i = 0; i < kou.length; i++) {
				var pai = kou[i];

				for (var j = 0; j < 3; j++) {
					var idx = holds.indexOf(pai);

					holds.splice(idx, 1);
				}
			}
		}

		sd.countMap = this.makeCountMap(holds);
	},

	getMings: function(sd, kou) {
		sd._holds = sd.holds.slice(0);

		this.initContext(sd, kou);

		return this.getMingPai(sd);
	},

	showCountMap: function(countMap) {
		for (var k in countMap) {
			if (countMap[k] > 0) {
				console.log(k + ': ' + countMap[k]);
			}
		}
	},

	getMingPai: function(sd) {
		var countMap = sd.countMap;
		var holds = sd._holds;
		var mings = [];

		for (var k in countMap) {
			var pai = parseInt(k);
			var cnt = countMap[k];
			if (0 == cnt) {
				continue;
			}

			countMap[k]--;

			var idx = holds.indexOf(pai);
			
			holds.splice(idx, 1);

			var tingMap = this.getTingMap(sd);
			var tings = [];
			for (var i in tingMap) {
				tings.push(parseInt(i));
			}

			if (tings && tings.length > 0) {
				if (cc.vv.gameNetMgr.checkCanChuPai(pai)) {
    				mings.push(pai);
				}
			}

			holds.splice(idx, 0, pai);
			countMap[k] = cnt;
		}

		return mings;
	},

	checkKouPai: function(sd, kou) {
		var canKou = [];
		var holds = sd._holds = sd.holds.slice(0);

		this.initContext(sd, kou);

		var countMap = sd.countMap;

		for (var k in countMap) {
			var pai = parseInt(k);
			var old = countMap[k];
			var c = old;
			if (old >= 3) {
				c = c - 3;
			} else {
				continue;
			}

			countMap[k] = c;

			for (var i = 0; i < 3; i++) {
				var idx = holds.indexOf(pai);
				holds.splice(idx, 1);
			}

			var mings = this.getMingPai(sd);
			if (mings && mings.length > 0) {
				canKou.push(pai);
			}

			for (var i = 0; i < 3; i++) {
				holds.splice(0, 0, pai);
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

		if (selected == -1) {
			return true;
		}

		if (c == 3) {
			countMap[selected] = 0;
			var ret = this.checkSingle(holds, countMap);
			countMap[selected] = c;
			if (ret) {
				return true;
			}
		} else if (c == 4) {
			countMap[selected] = 1;
			var ret = this.checkSingle(holds, countMap);
			countMap[selected] = c;
			if (ret) {
				return true;
			}
		}

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

