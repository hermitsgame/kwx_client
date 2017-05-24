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
        bgmVolume:1.0,
        sfxVolume:1.0,
        
        bgmAudioID:-1,
        
        dialectID: 0,
        speakerID: 0,
        
        _bgmUrl: null,
    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);
        }

        var t = cc.sys.localStorage.getItem("dialectID");
        if (t != null) {
            this.dialectID = parseInt(t);
        }

        var t = cc.sys.localStorage.getItem("speakerID");
        if (t != null) {
            this.speakerID = parseInt(t);
        }

        cc.game.on(cc.game.EVENT_HIDE, function() {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });

        cc.game.on(cc.game.EVENT_SHOW, function() {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    getUrl:function(url){
        return cc.url.raw("resources/sounds/" + url);
    },
    
    playBGM: function(url) {
        var audioUrl = this.getUrl(url);
        var bgmVolume = this.bgmVolume;

        console.log(audioUrl);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
            this.bgmAudioID = -1;
        }

        if (bgmVolume > 0) {
            this.bgmAudioID = cc.audioEngine.play(audioUrl, true, bgmVolume);
            console.log('playBGM: ' + bgmVolume);
        } else {
            this._bgmUrl = url;
        }
    },
    
    playSFX: function(url, cb) {
        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
			if (cb != null) {
				cc.audioEngine.setFinishCallback(audioId, cb);
			}
        }
    },

    playMusician: function() {
        var path = 'Sound_Musician/{0}/{1}/CeShi/yuyan_{2}.mp3';
        path = path.format(this.dialectID, this.speakerID + 1, this.getRandom(1, 2));

        this.playSFX(path);
    },

    getRandom: function(n, m) {
        var w = m - n;

        if (w == 0) {
            return n;
        }

        return Math.round(Math.random() * w + n);
    },

    playDialect: function(type, content, cb) {
        var dialect = ['PuTong', 'XiangYang', 'XiaoGan', 'SuiZhou', 'ShiYan'];
        var speaker = ['Man1', 'Man2', 'Woman1', 'Woman2'];
        var dirs = ['Card', 'Special'];
        var files = [];

        if (!cc.sys.isNative) {
            var path = 'Sound_{0}/{1}/Card/s_{2}_{3}_1.mp3';
            path = path.format(dialect[this.dialectID], speaker[this.speakerID], type, content);
            this.playSFX(path, cb);
            return;
        }

        for (var i = 0; i < dirs.length; i++) {
            var path = 'Sound_{0}/{1}/{2}/s_{3}_{4}';
            path = path.format(dialect[this.dialectID], speaker[this.speakerID], dirs[i], type, content);

            var idx = 1;

            do {
                var file = path + '_{0}.mp3';
                file = file.format(idx);
    
                if (jsb.fileUtils.isFileExist(this.getUrl(file))) {
	                files.push(file);
					idx++;
                } else {
					break;
                }
            } while (1);
        }

        if (files.length == 0) {
            console.log('Dialect not found: ' + type + ' ' + content);
            return;
        }

		var file = files[this.getRandom(0, files.length - 1)];
		console.log('play ' + file);

        this.playSFX(file, cb);
    },

    playCard: function(content) {
        this.playDialect('card', content);
    },

    playAction: function(action) {
        this.playDialect('game', action);
    },

    playHu: function(name, cb) {
        this.playDialect('hu', name, cb);
    },

    playBackGround : function() {
        var id = this.getRandom(1, 3);
        var path = 'Sound_BG/backmusic' + id + '.mp3';

        this.playBGM(path)
    },
    
    playQuyu: function(id) {
        var path = 'Sound_{0}/{1}/QuYu/quyu_{2}.mp3';
        var dialect = ['PuTong', 'XiangYang', 'XiaoGan', 'SuiZhou', 'ShiYan'];
        var speaker = ['Man1', 'Man2', 'Woman1', 'Woman2'];

        path = path.format(dialect[this.dialectID], speaker[this.speakerID], id);
		console.log('play: ' + path);
        this.playSFX(path);
    },

	playButtonClicked: function() {
		this.playSFX('Sound/Button_Click.mp3');
    },

    setDialect: function(id) {
        if (this.dialectID != id) {
            cc.sys.localStorage.setItem("dialectID", id);
            this.dialectID = id;
        }
    },
    
    setSpeaker: function(id) {
        if (this.speakerID != id) {
            cc.sys.localStorage.setItem("speakerID", id);
            this.speakerID = id;
        }
    },
    
    setSFXVolume: function(v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function(v, force) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }

        var old = this.bgmVolume;

        if (old != v || force) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            
            if (this.bgmAudioID >= 0) {
                cc.audioEngine.setVolume(this.bgmAudioID, v);
            } else {
                if (v > 0 && this._bgmUrl != null) {
                    this.playBGM(this._bgmUrl);
                }
            }
        }
    },

    pauseAll: function() {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function() {
        cc.audioEngine.resumeAll();
    }
});
