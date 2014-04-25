var TAG_SHARE_BY_SNWEIBO = 100;
var TAG_SHARE_BY_QQWEIBO = 101;
var TAG_SHARE_BY_QZONE = 102;
var TAG_SHARE_BY_TWWITER = 103;
var TAG_SHARE_BY_FACEBOOK = 104;

var EventMenuItem = function (id, tag) {
    this.id = id;
    this.tag = tag;
};

var s_EventMenuItem = [
    new EventMenuItem(s_snweibo, TAG_SHARE_BY_SNWEIBO),
    new EventMenuItem(s_qqweibo, TAG_SHARE_BY_QQWEIBO),
    new EventMenuItem(s_qzone, TAG_SHARE_BY_QZONE),
    new EventMenuItem(s_twitter, TAG_SHARE_BY_TWWITER),
    new EventMenuItem(s_facebook, TAG_SHARE_BY_FACEBOOK)
];

var MyLayer = cc.Layer.extend({
    init: function () {
        this._super();


        var size = cc.director.getVisibleSize();

        var bg = cc.Sprite.create(s_Background);
        bg.x = size.width / 2;
	    bg.y = size.height / 2;
        this.addChild(bg);

        var eglView = cc.view;
        var posBR = cc.p(eglView.getVisibleOrigin().x + eglView.getVisibleSize().width, eglView.getVisibleOrigin().y);
        var posBC = cc.p(eglView.getVisibleOrigin().x + eglView.getVisibleSize().width / 2, eglView.getVisibleOrigin().y);
        var posTL = cc.p(eglView.getVisibleOrigin().x, eglView.getVisibleOrigin().y + eglView.getVisibleSize().height);

        var closeItem = cc.MenuItemImage.create(
            s_CloseNormal,
            s_CloseSelected,
            this.menuCloseCallback,
            this);
        closeItem.x = posBR.x - 20;
	    closeItem.y = posBR.y + 20;

        // create menu, it's an autorelease object
        var pMenu = cc.Menu.create(closeItem);
        pMenu.x = 0;
	    pMenu.y = 0;
        this.addChild(pMenu, 1);

        var posStep = cc.p(150, -150);
        var beginPos = cc.pAdd(posTL, cc.pMult(posStep, 0.5));
        var line = 0;
        var row = 0;
        for (var i = 0; i < s_EventMenuItem.length; i++) {
            var menuItem = cc.MenuItemImage.create(s_EventMenuItem[i].id, s_EventMenuItem[i].id,
                this.eventMenuCallback, this);
            pMenu.addChild(menuItem, 0, s_EventMenuItem[i].tag);

            var pos = cc.pAdd(beginPos, cc.p(posStep.x * row, posStep.y * line));
            var itemSize = menuItem.getContentSize();
            if ((pos.x + itemSize.width / 2) > posBR.x) {
                line += 1;
                row = 0;
                pos = cc.pAdd(beginPos, cc.p(posStep.x * row, posStep.y * line));
            }
            row += 1;
            menuItem.x = pos.x;
	        menuItem.y = pos.y;
        }

        var label = cc.LabelTTF.create("Reload all plugins", "Arial", 24);
        var menuItem = cc.MenuItemLabel.create(label, this.reloadPluginMenuCallback, this);
        menuItem.setAnchorPoint(0.5, 0);
        pMenu.addChild(menuItem, 0);
        menuItem.x = posBC.x;
	    menuItem.y = posBC.y;
    },
    //a selector callback
    menuCloseCallback: function (sender) {
        MySocialManager.getInstance().unloadSocialPlugin();
        MySocialManager.getInstance().loadSocialPlugin();
    },
    eventMenuCallback: function (sender) {
        var info = {};
        info["SharedText"] = "Share message : HelloSocial!";
        info["SharedImagePath"] = "http://www.cocos2d-x.org/images/banner-left.png";
        info["SharedURLPath"] = "http://www.cocos2d-x.org";

        var mode = sender.getTag() - TAG_SHARE_BY_SNWEIBO + 1;
        MySocialManager.getInstance().shareByMode(info, mode);
    },
    reloadPluginMenuCallback: function (sender) {
        MySocialManager.purgeManager();
    }
});

var MyScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
