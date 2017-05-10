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
        _lastTouchTime: null,
        _voice:null,
        _volume:null,
        _mic: null,
        _notice: null,
        _cancel: null,
		_warning: null,

        _lastCheckTime:-1,
        _timeBar:null,
        MAX_TIME:15000,

		_state: -1,
    },

    // use this for initialization
    onLoad: function () {
        
        var voice = cc.find("Canvas/voice");
		this._voice = voice;

        voice.active = false;

        var volume = voice.getChildByName('volume');
		this._volume = volume;
		
        for (var i = 0; i < volume.children.length; ++i) {
            volume.children[i].active = false;
        }

		this._notice = voice.getChildByName('notice').getComponent(cc.Label);
		this._mic = voice.getChildByName('mic');
		this._cancel = voice.getChildByName('cancel');
		this._warning = voice.getChildByName('warning');
		
		this._timeBar = voice.getChildByName('time');
		this._timeBar.scaleX = 0.0;
        
        var self = this;
        var btnVoice = cc.find("Canvas/btn_voice");

        if (btnVoice) {
            btnVoice.on(cc.Node.EventType.TOUCH_START, function(event) {
                console.log("cc.Node.EventType.TOUCH_START");
                self.enterState(0);
            });

            btnVoice.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
                console.log("cc.Node.EventType.TOUCH_MOVE");

				var target = event.getCurrentTarget();
				var touches = event.getTouches();
				var locationInNode = target.convertTouchToNodeSpaceAR(touches[0]);

				var s = target.getContentSize();
				var rect = cc.rect(0 - s.width / 2, 0 - s.height / 2, s.width, s.height);

				if (cc.rectContainsPoint(rect, locationInNode)) {
					self.enterState(2);
				} else {
					self.enterState(1);
				}
            });
                        
            btnVoice.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("cc.Node.EventType.TOUCH_END");
				self.enterState(4);
            });
            
            btnVoice.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
                console.log("cc.Node.EventType.TOUCH_CANCEL");
				self.enterState(3);
            });
        }

		btnVoice.active = !cc.vv.replayMgr.isReplay();
    },

	enterState: function(state) {
		var voice = this._voice;
		var mic = this._mic;
		var volume = this._volume;
		var notice = this._notice;
		var cancel = this._cancel;
		var warning = this._warning;
		var timeBar = this._timeBar;

        console.log('enterState: ' + state);

		switch (state) {
			case 0:  // touch start
				cc.vv.voiceMgr.prepare("record.amr");
                this._lastTouchTime = Date.now();

				voice.active = true;
				mic.active = true;
				volume.active = true;
				cancel.active = false;
				warning.active = false;

                timeBar.scaleX = 0;

				notice.string = '滑动手指，取消发送';
				break;
			case 1:  // touch move - out of button
    			console.log('1');
				if (this._lastTouchTime != null) {
					mic.active = false;
					volume.active = false;
					cancel.active = true;
					warning.active = false;

					notice.string = '松开手指，取消发送';
				}
				break;
			case 2: // touch move - in button
    			console.log('2');
				if (this._lastTouchTime != null) {
					mic.active = true;
					volume.active = true;
					cancel.active = false;
					warning.active = false;

					notice.string = '滑动手指，取消发送';
				}
				break;
			case 3:  // touch cancel
    			console.log('3');
				if (this._lastTouchTime != null) {
					cc.vv.voiceMgr.cancel();
					this._lastTouchTime = null;
					voice.active = false;
				}
				break;
			case 4:  // touch end
			    console.log('4');
				if (this._lastTouchTime != null) {
					if (Date.now() - this._lastTouchTime < 1000) {
						cc.vv.voiceMgr.cancel();
						voice.active = true;
						mic.active = false;
					    volume.active = false;
					    cancel.active = false;
					    warning.active = true;
						timeBar.scaleX = 0;
						notice.string = '录制时间太短';
						
						setTimeout(function() {
						    voice.active = false;
						}, 1000);
					} else {
						this.onVoiceOK();
					}

					this._lastTouchTime = null;
				}
				
				break;
			default:
				break;
		}
    },

    onVoiceOK: function() {
        if (this._lastTouchTime != null) {
            cc.vv.voiceMgr.release();
            var time = Date.now() - this._lastTouchTime;
            var msg = cc.vv.voiceMgr.getVoiceData("record.amr");
            cc.vv.net.send("voice_msg", {msg: msg, time: time});
        }

        this._voice.active = false;
    },
    
    onBtnOKClicked:function(){
        this._voice.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    update: function(dt) {
    	var now = Date.now();

        if (this._voice.active && this._volume.active) {
            if (now - this._lastCheckTime > 300) {
				var v = cc.vv.voiceMgr.getVoiceLevel(5);

                for (var i = 0; i < this._volume.children.length; ++i) {
					this._volume.children[i].active = v > i;
                }

                this._lastCheckTime = now;
            }
        }
        
        if (this._lastTouchTime != null) {
            var time = now - this._lastTouchTime;
            if (time >= this.MAX_TIME) {
                this.onVoiceOK();
                this._lastTouchTime = null;
            } else {
                var percent = time / this.MAX_TIME;
                this._timeBar.scaleX = percent;
            }
        }
    },
});
