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
        _chatRoot:null,
        
        _quickChatInfo:null,
        _btnChat:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        cc.vv.chat = this;
        
        this._btnChat = this.node.getChildByName("btn_chat");
        this._btnChat.active = !cc.vv.replayMgr.isReplay();
        
        this._chatRoot = this.node.getChildByName("chat");
        this._chatRoot.active = false;
        
        var content = cc.find("Canvas/chat/scroll/view/content");
        var itemTemp = content.getChildByName("item");
        var barrier = content.getChildByName("barrier");
        
        content.removeChild(itemTemp);
        content.removeChild(barrier);
        
        this._quickChatInfo = {};
        this._quickChatInfo["item0"] = {index:0, content:"咋弄的呀，你还打不打？", sound:"fix_msg_1.mp3"};
        this._quickChatInfo["item1"] = {index:1, content:"快点啊，我等的花都谢了", sound:"fix_msg_2.mp3"};
        this._quickChatInfo["item2"] = {index:2, content:"打球个牌，怎么这么慢啊", sound:"fix_msg_3.mp3"};
        this._quickChatInfo["item3"] = {index:3, content:"太爽了，这牌能给你们打满", sound:"fix_msg_4.mp3"};
        this._quickChatInfo["item4"] = {index:4, content:"莫慌这牌胡的宽的很", sound:"fix_msg_5.mp3"};
        this._quickChatInfo["item5"] = {index:5, content:"亮倒！搞满你们", sound:"fix_msg_6.mp3"};
        this._quickChatInfo["item6"] = {index:6, content:"我这牌胡劲大的很", sound:"fix_msg_7.mp3"};
        this._quickChatInfo["item7"] = {index:7, content:"13不靠呀", sound:"fix_msg_8.mp3"};
        this._quickChatInfo["item8"] = {index:8, content:"都懒得打了", sound:"fix_msg_9.mp3"};
        this._quickChatInfo["item9"] = {index:9, content:"让我闯一下行吗", sound:"fix_msg_9.mp3"};
        
        for (var i = 0; i < 10; i++) {
            var name = "item" + i;
            var info = this._quickChatInfo[name];
            
            var item = cc.instantiate(itemTemp);
            item.name = name;

            var lblInfo = item.getChildByName("msg").getComponent(cc.Label);
            lblInfo.string = (info.index + 1) + "." + info.content;
            
            content.addChild(item);
            
            if (i != 9) {
                content.addChild(cc.instantiate(barrier));
            }
        }
    },
    
    getQuickChatInfo(index){
        var key = "item" + index;
        return this._quickChatInfo[key];   
    },
    
    onBtnChatClicked:function(){
        this._chatRoot.active = true;
    },
    
    onBgClicked:function(){
        this._chatRoot.active = false;
    },
    
    onQuickChatItemClicked:function(event){
        this._chatRoot.active = false;
        var info = this._quickChatInfo[event.target.name];
        cc.vv.net.send("quick_chat", info.index);
    },
});
