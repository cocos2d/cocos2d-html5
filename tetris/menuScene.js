//require("JS/game.js");
//require("JS/block.js");

var MainMenu = {};
MainMenu.scene = function () {
    var menuScene = new cc.Scene();

    var menu = new cc.Menu();

    var label1 = new cc.LabelTTF("Play","Chalkboard SE", 18.0);
    var label2 = new cc.LabelTTF("Options","Chalkboard SE", 18.0);

    var item1 = new cc.MenuItemLabel(label1, function () {
        cc.LOG("game will start");
        Game.start();
    });
    var item2 = new cc.MenuItemLabel(label2, function () {
        cc.LOG("options");
    });
    item1.setPosition(new cc.Point(160, 300));
    item2.setPosition(new cc.Point(160, 150));

    menu.addChild(item1, item2);
    menu.setPosition(new cc.Point(0, 0));
    menuScene.addChild(menu);


    // preload music
    //cc.AudioManager.preloadBackgroundMusic("music.mp3", true);

    return menuScene;

};
