
var ACTION_CHUPAI = 1;
var ACTION_MOPAI = 2;
var ACTION_PENG = 3;
var ACTION_GANG = 4;
var ACTION_HU = 5;
var ACTION_ZIMO = 6;
var ACTION_MING = 7;

cc.Class({
    extends: cc.Component,

    properties: {
        _lastAction: null,
        _actionRecords: null,
        _currentIndex: 0,

		_data: null,
		_roominfo: null,
    },

    onLoad: function() {

    },

    clear: function() {
        this._lastAction = null;
        this._actionRecords = null;
        this._currentIndex = 0;
    },

    init: function(roominfo, data) {
    	
        this._actionRecords = data.action_records;
        if (this._actionRecords == null) {
            this._actionRecords = [];
        }

		this._roominfo = roominfo;
		this._data = data;

        this._currentIndex = 0;
        this._lastAction = null;
    },

    isReplay: function() {
        return this._actionRecords != null;    
    },

	gotoAction: function(index) {
		this._currentIndex = 0;
        this._lastAction = null;

		var records = this._actionRecords;
		var total = records.length / 3;

		if (index >= total) {
			return false;
		}

		var id = 0;
		while (id < index) {
			this.takeAction(true);
			id += 1;
		}

		return true;
    },

	prev: function(num) {
		var index = this._currentIndex / 3;

		if (num <= index) {
			index -= num;
		} else {
			index = 0;
		}

		var gameNetMgr = cc.vv.gameNetMgr;

		gameNetMgr.reset();
		gameNetMgr.prepareReplay(this._roominfo, this._data);

		this.gotoAction(index);
    },

	forward: function(num) {
		var id = 0;

		while (id < num) {
			this.takeAction(true);
			id += 1;
		}

		var gameNetMgr = cc.vv.gameNetMgr;
    },

    getNextAction: function() {
		var index = this._currentIndex;
        if (index >= this._actionRecords.length) {
            return null;
        }

        var si = this._actionRecords[index];
        var action = this._actionRecords[index + 1];
        var pai = this._actionRecords[index + 2];

		this._currentIndex += 3;

        return { si: si, type: action, pai: pai };
    },

    takeAction: function(skip) {
        var action = this.getNextAction();
        if (this._lastAction != null &&
			this._lastAction.type == ACTION_CHUPAI)
		{
            if (action != null &&
				action.type != ACTION_PENG &&
				action.type != ACTION_GANG &&
				action.type != ACTION_HU)
			{
                cc.vv.gameNetMgr.doGuo(this._lastAction.si, this._lastAction.pai, skip);
            }
        }

        this._lastAction = action;
        if (action == null) {
            return -1;
        }

        var nextActionDelay = 1.0;
        if (action.type == ACTION_CHUPAI) {
            cc.vv.gameNetMgr.doChupai(action.si, action.pai, skip);
            return 1.0;
        } else if (action.type == ACTION_MOPAI) {
            cc.vv.gameNetMgr.doMopai(action.si, action.pai, skip);
            cc.vv.gameNetMgr.doTurnChange(action.si, skip);
            return 0.5;
        } else if (action.type == ACTION_PENG) {
            cc.vv.gameNetMgr.doPeng(action.si, action.pai, skip);
            cc.vv.gameNetMgr.doTurnChange(action.si, skip);
            return 1.0;
        } else if (action.type == ACTION_GANG) {
        	if (!skip) {
				cc.vv.gameNetMgr.dispatchEvent('hangang_notify', action.si);
        	}

            cc.vv.gameNetMgr.doGang(action.si, action.pai, null, null, null, skip);
            cc.vv.gameNetMgr.doTurnChange(action.si, skip);
            return 1.0;
        } else if (action.type == ACTION_HU) {
            cc.vv.gameNetMgr.doHu({ seatindex: action.si, hupai: action.pai, iszimo: false }, skip);
            return 1.5;
        } else if (action.type == ACTION_ZIMO) {
            cc.vv.gameNetMgr.doHu({ seatindex: action.si, hupai: action.pai, iszimo: true }, skip);
            return 1.5;
        } else if (action.type == ACTION_MING) {
            cc.vv.gameNetMgr.doMing(action.si, null, null, null, skip);
            return 1.0;
        }
    }
});

