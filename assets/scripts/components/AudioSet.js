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
        _sptMusicBG: null,
        _sptMusicGame: null,
        _dialects: [],
        _chooseSpeaker: null,
        _speakers: [],
        _selectedDialect: 0,
    },

    // use this for initialization
    onLoad: function () {
        // init music_bg
        var btnMusicBG = cc.find('body/music_bg', this.node);
        var sptMusicBG = btnMusicBG.getComponent('SpriteMgr');

        cc.vv.utils.addClickEvent(btnMusicBG, this.node, "AudioSet", "onMusicBGClicked");

        var music_bg = cc.vv.audioMgr.bgmVolume > 0 ? 1 : 0;
        sptMusicBG.setIndex(music_bg);
        this._sptMusicBG = sptMusicBG;

        // init music_game
        var btnMusicGame = cc.find('body/music_game', this.node);
        var sptMusicGame = btnMusicGame.getComponent('SpriteMgr');

        cc.vv.utils.addClickEvent(btnMusicGame, this.node, "AudioSet", "onMusicGameClicked");
        
        var music_game = cc.vv.audioMgr.sfxVolume > 0 ? 1 : 0;
        sptMusicGame.setIndex(music_game);
        this._sptMusicGame = sptMusicGame;
        
        // init dialect && speaker
        var dialects = cc.find('body/dialects', this.node);
        for (var i = 0; i < dialects.childrenCount; i++) {
            var dialect = dialects.children[i];
            var sptDialect = dialect.getComponent('SpriteMgr');

            cc.vv.utils.addClickEvent(dialect, this.node, "AudioSet", "onDialectBtnClicked", '' + i);
            this._dialects.push(dialect);
        }
        
        this.refreshDialects();
        
        // init choose speaker dialog
        var chooseSpeaker = cc.find('body/speakers', this.node);
        this._chooseSpeaker = chooseSpeaker;
        
        var voices = chooseSpeaker.getChildByName('voices');
        for (var i = 0; i < voices.childrenCount; i++) {
            var v = voices.children[i];

            cc.vv.utils.addClickEvent(v, this.node, "AudioSet", "onSpeakerBtnClicked", '' + i);
            this._speakers.push(v);
        }
        
        chooseSpeaker.active = false;

		var btnLogout = cc.find('body/btnLogout', this.node);

		if (cc.director.getScene().name == 'hall') {
			cc.vv.utils.addClickEvent(btnLogout, this.node, "AudioSet", "onLogoutClicked");
		} else {
			btnLogout.active = false;
		}

		var btnClose = cc.find('body/btnClose', this.node);
		cc.vv.utils.addClickEvent(btnClose, this.node, "AudioSet", "onCloseClicked");
    },

    refreshDialects: function() {
        var dialectID = cc.vv.audioMgr.dialectID;
        var speakerID = cc.vv.audioMgr.speakerID;
        var dialects = this._dialects;

        for (var i = 0; i < dialects.length; i++) {
            var dialect = dialects[i];
            var spt = dialect.getComponent('SpriteMgr');
            var tips = dialect.children[0];
            var sptTips = tips.getComponent('SpriteMgr');
            
            var selected = (dialectID == i);
            
            spt.setIndex(selected ? 1 : 0);
            sptTips.setIndex(selected ? speakerID + 1 : 0);
        }
    },

    refreshSpeakers: function() {
        var dialectID = cc.vv.audioMgr.dialectID;
        var speakerID = cc.vv.audioMgr.speakerID;
        var speakers = this._speakers;
        var selected = this._selectedDialect;
        
        for (var i = 0; i < speakers.length; i++) {
            var v = speakers[i];
            var spt = v.getComponent('SpriteMgr');
            var tips = v.children[0];
            var sptTips = tips.getComponent('SpriteMgr');

            var id = (dialectID == selected && speakerID == i) ? 1 : 0;
            spt.setIndex(id);
            sptTips.setIndex(selected);
        }
    },

    onDialectBtnClicked: function(event, data) {
        this._selectedDialect = parseInt(data);
        
        console.log('_selectedDialect: ' + this._selectedDialect);
        
        this.refreshSpeakers();
        
        this._chooseSpeaker.active = true;
    },
    
    onSpeakerBtnClicked: function(event, data) {
        var mgr = cc.vv.audioMgr;
        mgr.setDialect(this._selectedDialect);
        mgr.setSpeaker(parseInt(data));

        mgr.playMusician();
        
        this.refreshSpeakers();
        this.refreshDialects();
    },

    getSpriteMgr: function(path) {
        var node = cc.find(path, this.node);
        if (!node) {
            return null;
        }
        
        return node.getComponent('SpriteMgr');
    },

    onMusicBGClicked: function() {
        var sptMusicBG = this._sptMusicBG;
        var volume = cc.vv.audioMgr.bgmVolume > 0 ? 0 : 1;

        cc.vv.audioMgr.playButtonClicked();

        cc.vv.audioMgr.setBGMVolume(volume);
        sptMusicBG.setIndex(volume);
    },

    onMusicGameClicked: function() {
        var sptMusicGame = this._sptMusicGame;
        var volume = cc.vv.audioMgr.sfxVolume > 0 ? 0 : 1;

        cc.vv.audioMgr.playButtonClicked();

        cc.vv.audioMgr.setSFXVolume(volume);
        sptMusicGame.setIndex(volume);
    },

    onLogoutClicked: function() {
        cc.vv.audioMgr.playButtonClicked();
        cc.vv.utils.showDialog(this.node, 'body', false);

    	cc.vv.alert.show('确认重新登录吗?', function() {
			cc.sys.localStorage.removeItem("wx_account");
			cc.sys.localStorage.removeItem("wx_sign");
			cc.director.loadScene("login");
		}, true);
    },

	onCloseClicked: function() {
	    cc.vv.audioMgr.playButtonClicked();
		cc.vv.utils.showDialog(this.node, 'body', false);
    },
});

