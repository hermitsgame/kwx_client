
if(window.io == null){
    window.io = require("socket-io");
}
 
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        ip: '',
        sio: null,
        isPinging: false,
        fnDisconnect: null,
        handlers: {},
		isBackground: false,
		
        addHandler: function(event,fn) {
            if(this.handlers[event]){
                console.log("event:" + event + "' handler has been registered.");
                return;
            }

            var handler = function(data) {
                if(event != "disconnect" && typeof(data) == "string"){
                    data = JSON.parse(data);
                }

                fn(data);
            };
            
            this.handlers[event] = handler; 
            if (this.sio) {
                console.log("register:function " + event);
                this.sio.on(event,handler);
            }
        },
        connect:function(fnConnect,fnError) {
            var self = this;
            
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            this.sio = window.io.connect(this.ip,opts);
            this.sio.on('reconnect',function(){
                console.log('reconnection');
            });
            this.sio.on('connect',function(data){
				console.log('connection');
                self.sio.connected = true;
                fnConnect(data);
            });
            
            this.sio.on('disconnect',function(data){
                console.log("disconnect");
                self.sio.connected = false;
                self.close();
            });
            
            this.sio.on('connect_failed',function (){
                console.log('connect_failed');
            });
            
            for(var key in this.handlers){
                var value = this.handlers[key];
                if(typeof(value) == "function"){
                    if(key == 'disconnect'){
                        this.fnDisconnect = value;
                    }
                    else{
                        console.log("register:function " + key);
                        this.sio.on(key,value);                        
                    }
                }
            }
            
            this.startHearbeat();

			cc.game.on(cc.game.EVENT_HIDE, function() {
				self.isBackground = true;
			});

			cc.game.on(cc.game.EVENT_SHOW, function() {
				self.isBackground = false;

				self.lastRecieveTime = Date.now();

				self.ping();
/*
				var offset = self.lastHideTime - self.lastRecieveTime;
				if (offset > 0) {
					self.lastRecieveTime = Date.now() - offset;
				}
*/
			});
        },

        startHearbeat: function() {
			var self = this;
            this.sio.on('game_pong', function() {
                self.lastRecieveTime = Date.now();
            });

            this.lastRecieveTime = Date.now();
            
            if (!self.isPinging) {
                self.isPinging = true;
                setInterval(function() {
                    if (self.sio) {
                        if (Date.now() - self.lastRecieveTime > 10000) {
                            self.close();
                        } else {
                            self.ping();
                        }
                    }
                }, 3000);
            }   
        },

        send:function(event,data){
            if(this.sio.connected){
                if(data != null && (typeof(data) == "object")){
                    data = JSON.stringify(data);
                }

                this.sio.emit(event,data);                
            }
        },
        
        ping:function(){
            this.send('game_ping');
        },
        
        close:function(){
            console.log('close');
            if(this.sio && this.sio.connected){
                this.sio.connected = false;
                this.sio.disconnect();
                this.sio = null;
            }
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
        },
        
        test:function(fnResult){
            var xhr = null;
            var fn = function(ret){
                fnResult(ret.isonline);
                xhr = null;
            }
            
            var arr = this.ip.split(':');
            var data = {
                account:cc.vv.userMgr.account,
                sign:cc.vv.userMgr.sign,
                ip:arr[0],
                port:arr[1],
            }
            xhr = cc.vv.http.sendRequest("/is_server_online",data,fn);
            setTimeout(function(){
                if(xhr){
                    xhr.abort();
                    fnResult(false);                    
                }
            },1500);
            /*
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            var self = this;
            this.testsio = window.io.connect(this.ip,opts);
            this.testsio.on('connect',function(){
                console.log('connect');
                self.testsio.close();
                self.testsio = null;
                fnResult(true);
            });
            this.testsio.on('connect_error',function(){
                console.log('connect_failed');
                self.testsio = null;
                fnResult(false);
            });
            */
        }
    },
});
