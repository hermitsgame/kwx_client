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
    },

    addClickEvent:function(node, target, component, handler, data) {
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = data;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

	showDialog: function(dialog, path, enable, parent) {
		var body = cc.find(path, dialog);

		if (enable) {
			body.scaleX = 0.7;
			body.scaleY = 0.7;
			body.opacity = 120;
			dialog.active = true;

			var action = cc.sequence(cc.spawn(cc.scaleTo(0.2, 1.1), cc.fadeTo(0.2, 200)),
									cc.spawn(cc.scaleTo(0.1, 1.0), cc.fadeTo(0.1, 255)));

			body.runAction(action);
		} else {
			var data = {
				dialog: dialog,
				parent: parent,
			};

			var finished = cc.callFunc(function(target, node) {
				node.dialog.active = false;

				if (node.parent) {
					node.parent.active = false;
				}
			}, this, data);

			var action = cc.sequence(cc.spawn(cc.scaleTo(0.1, 0.7), cc.fadeTo(0.1, 120)),
									finished);

			body.runAction(action);
		}
    },

    showFrame: function(frame, headPath, bodyPath, enable, parent) {
		var head = cc.find(headPath, frame);
		var body = cc.find(bodyPath, frame);

		if (enable) {
			head.opacity = 0;
			body.opacity = 0;
			frame.active = true;

			var nodes = {
				head: head,
				body: body,
			};

			var showHead = cc.callFunc(function(target, data) {
				data.head.opacity = 255;
			}, this, nodes);

			var showBody = cc.callFunc(function(target, data) {
				data.body.opacity = 255;
			}, this, nodes);

			var actionHead = cc.sequence(cc.hide(),
										cc.place(head.x, head.y + head.height),
										cc.show(),
										showHead,
										cc.moveBy(0.3, 0, 0 - head.height));
			head.runAction(actionHead);

			var actionBody = cc.sequence(cc.hide(),
										cc.place(body.x, body.y - body.height),
										cc.show(),
										showBody,
										cc.moveBy(0.3, 0, body.height));
			body.runAction(actionBody);
		} else {
			var data = {
				headX: head.x,
				headY: head.y,
				bodyX: body.x,
				bodyY: body.y,
				head: head,
				body: body,
				node: frame,
				parent: parent,
			};

			var finished = cc.callFunc(function(target, data) {
				data.node.active = false;

				data.head.y = data.headY;
				data.body.y = data.bodyY;
				
				if (data.parent) {
					data.parent.active = false;
				}
			}, this, data);

			var actionHead = cc.moveBy(0.3, 0, head.height);
			head.runAction(actionHead);

			var actionBody = cc.sequence(cc.moveBy(0.31, 0, 0 - body.height), finished);
			body.runAction(actionBody);
		}
    },
});

