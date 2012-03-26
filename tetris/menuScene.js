//require("JS/game.js");
//require("JS/block.js");

var MainMenu = {};
MainMenu.start = function()
{
    var menuScene = cc.Scene.node();
    var label1 = cc.LabelTTF.labelWithString("Play","Chalkboard SE", 18.0);
    var label2 = cc.LabelTTF.labelWithString("Options","Chalkboard SE", 18.0);
    var item1 = cc.MenuItemLabel.itemWithLabel(label1, function () {
        Game.start();
    });
    var item2 = cc.MenuItemLabel.itemWithLabel(label2, function () {
        console.log("options");
    });
    item1.setPosition(cc.ccp(160, 300));
    item2.setPosition(cc.ccp(160, 150));

    var menu = cc.Menu.menuWithItems(item1, item2);
    menuScene.addChild(menu);
    menuScene.onExit = function()//hide the dom menu
    {
        menuScene.getChildren()[0].hide();
    };
    // preload music
    //cc.AudioManager.preloadBackgroundMusic("music.mp3", true);

    return menuScene;

};
