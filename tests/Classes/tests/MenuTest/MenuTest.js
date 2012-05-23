/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


var kTagMenu = 77771;
var kTagMenu0 = 77770;
var kTagMenu1 = 77771;


//------------------------------------------------------------------
//
// MenuLayer1
//
//------------------------------------------------------------------
var MenuLayer1 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontSize(30);
        cc.MenuItemFont.setFontName("Courier New");
        this.setIsTouchEnabled(true);
        // Font Item

        var spriteNormal = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 0, 115, 23));

        var item1 = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal, spriteSelected, spriteDisabled, this, this.menuCallback);

        // Image Item
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_SendScore, s_PressSendScore, this, this.menuCallback2);

        // Label Item (LabelAtlas)
        var labelAtlas = cc.LabelAtlas.labelWithString("0123456789", "Resources/fonts/fps_images.png", 16, 24, '.');
        var item3 = cc.MenuItemLabel.itemWithLabel(labelAtlas, this, this.menuCallbackDisabled);
        item3.setDisabledColor(cc.ccc3(32, 32, 64));
        item3.setColor(cc.ccc3(200, 200, 255));

        // Font Item
        var item4 = cc.MenuItemFont.itemFromString("I toggle enable items", this, this.menuCallbackEnabled);

        item4.setFontSizeObj(20);
        cc.MenuItemFont.setFontName("Marker Felt");

        // Label Item (CCLabelBMFont)
        //var label = cc.LabelBMFont.labelWithString("configuration", "Resources/fonts/bitmapFontTest3.fnt");
        var label = cc.LabelTTF.labelWithString("configuration","Arial",28);
        var item5 = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallbackConfig);

        // Testing issue #500
        item5.setScale(0.8);

        // Font Item
        var item6 = cc.MenuItemFont.itemFromString("Quit", this, this.onQuit);

        var color_action = cc.TintBy.actionWithDuration(0.5, 0, -255, -255);
        var color_back = color_action.reverse();
        var seq = cc.Sequence.actions(color_action, color_back, null);
        item6.runAction(cc.RepeatForever.actionWithAction(seq));

        var menu = cc.Menu.menuWithItems(item1, item2, item3, item4, item5, item6, null);
        menu.alignItemsVertically();


        // elastic effect
        var s = cc.Director.sharedDirector().getWinSize();

        var child;
        var pArray = menu.getChildren();
        for (var i = 0; i < pArray.length; i++) {
            if (pArray[i] == null)
                break;

            child = pArray[i];

            var dstPoint = child.getPosition();
            var offset = (s.width / 2 + 50);
            if (i % 2 == 0)
                offset = -offset;

            child.setPosition(cc.PointMake(dstPoint.x + offset, dstPoint.y));
            child.runAction(
                cc.EaseElasticOut.actionWithAction(cc.MoveBy.actionWithDuration(2, cc.PointMake(dstPoint.x - offset, 0)), 0.35)
            );
        }
        this._m_disabledItem = item3;
        this._m_disabledItem.setIsEnabled(false);

        this.addChild(menu);
    },
    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, cc.kCCMenuTouchPriority + 1, true);
    },
    ccTouchBegan:function () {
        return true;
    },
    menuCallback:function (sender) {
        this._m_pParent.switchTo(1);
    },
    menuCallbackConfig:function (sender) {
        this._m_pParent.switchTo(3);
    },
    allowTouches:function (dt) {
        cc.TouchDispatcher.sharedDispatcher().setPriority(cc.kCCMenuTouchPriority + 1, this);
        this.unscheduleAllSelectors();
        cc.LOG("Touches allowed again!");
    },
    menuCallbackDisabled:function (sender) {
        // hijack all touch events for 5 seconds
        cc.TouchDispatcher.sharedDispatcher().setPriority(cc.kCCMenuTouchPriority - 1, this);
        this.schedule(this.allowTouches, 5.0);
        cc.Log("TOUCHES DISABLED FOR 5 SECONDS");
    },
    menuCallbackEnabled:function (sender) {
        this._m_disabledItem.setIsEnabled(!this._m_disabledItem.getIsEnabled());
    },
    menuCallback2:function (sender) {
        this._m_pParent.switchTo(2);
    },
    onQuit:function (sender) {
        cc.Assert(0,"Quit!");
    }
});

//------------------------------------------------------------------
//
// MenuLayer2
//
//------------------------------------------------------------------
var MenuLayer2 = cc.Layer.extend({
    ctor:function () {
        for (var i = 0; i < 2; i++) {
            var item1 = cc.MenuItemImage.itemFromNormalImage(s_PlayNormal, s_PlaySelect, this, this.menuCallback);
            var item2 = cc.MenuItemImage.itemFromNormalImage(s_HighNormal, s_HighSelect, this, this.menuCallbackOpacity);
            var item3 = cc.MenuItemImage.itemFromNormalImage(s_AboutNormal, s_AboutSelect, this, this.menuCallbackAlign);
            item1.setScaleX(1.5);
            item2.setScaleX(0.5);
            item3.setScaleX(0.5);
            var menu = cc.Menu.menuWithItems(item1, item2, item3);
            menu.setTag(kTagMenu);
            this.addChild(menu, 0, 100 + i);
            this._m_centeredMenu = menu.getPosition();
        }
        this._m_alignedH = true;
        this.alignMenuH();
    },
    alignMenuH:function () {
        for (var i = 0; i < 2; i++) {
            var menu = this.getChildByTag(100 + i);
            menu.setPosition(this._m_centeredMenu);
            if (i == 0) {
                menu.alignItemsHorizontally();
                var p = menu.getPosition();
                menu.setPosition(cc.ccpAdd(p, cc.PointMake(0, 30)));
            }
            else {
                menu.alignItemsHorizontallyWithPadding(40);
                var p = menu.getPosition();
                menu.setPosition(cc.ccpSub(p, cc.PointMake(0, 30)));
            }
        }
    },
    alignMenusV:function () {
        for (var i = 0; i < 2; i++) {
            var menu = this.getChildByTag(100 + i);
            menu.setPosition(this._m_centeredMenu);
            if (i == 0) {
                menu.alignItemsVertically();
                var p = menu.getPosition();
                menu.setPosition(cc.ccpAdd(p, cc.PointMake(100, 0)));
            }
            else {
                menu.alignItemsVerticallyWithPadding(40);
                var p = menu.getPosition();
                menu.setPosition(cc.ccpSub(p, cc.PointMake(100, 0)));
            }
        }
    },
    menuCallback:function (sender) {
        this._m_pParent.switchTo(0);
    },
    menuCallbackOpacity:function (sender) {
        var menu = sender.getParent();
        var opacity = menu.getOpacity();
        if (opacity == 128)
            menu.setOpacity(255);
        else
            menu.setOpacity(128);
    },
    menuCallbackAlign:function (sender) {
        this._m_alignedH = !this._m_alignedH;
        if (this._m_alignedH)
            this.alignMenuH();
        else
            this.alignMenusV();
    }
});

//------------------------------------------------------------------
//
// MenuLayer3
//
//------------------------------------------------------------------
var MenuLayer3 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(28);

        //var label = cc.LabelBMFont.labelWithString("Enable AtlasItem", "Resources/fonts/bitmapFontTest3.fnt");
        var label = cc.LabelTTF.labelWithString("Enable AtlasItem","Arial",28);
        var item1 = cc.MenuItemLabel.itemWithLabel(label, this, this.menuCallback2);
        var item2 = cc.MenuItemFont.itemFromString("--- Go Back ---", this, this.menuCallback);

        var spriteNormal = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 23 * 2, 115, 23));
        var spriteSelected = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 23, 115, 23));
        var spriteDisabled = cc.Sprite.spriteWithFile(s_MenuItem, cc.RectMake(0, 0, 115, 23));


        var item3 = cc.MenuItemSprite.itemFromNormalSprite(spriteNormal, spriteSelected, spriteDisabled, this, this.menuCallback3);
        this._m_disabledItem = item3;
        this._m_disabledItem.setIsEnabled(false);

        var menu = cc.Menu.menuWithItems(item1, item2, item3);
        menu.setPosition(cc.PointMake(0, 0));

        var s = cc.Director.sharedDirector().getWinSize();

        item1.setPosition(cc.PointMake(s.width / 2 - 150, s.height / 2));
        item2.setPosition(cc.PointMake(s.width / 2 - 200, s.height / 2));
        item3.setPosition(cc.PointMake(s.width / 2, s.height / 2 - 100));

        var jump = cc.JumpBy.actionWithDuration(3, cc.PointMake(400, 0), 50, 4);
        item2.runAction(cc.RepeatForever.actionWithAction(
            (cc.Sequence.actions(jump, jump.reverse()))
        )
        );
        var spin1 = cc.RotateBy.actionWithDuration(3, 360);
        var spin2 = spin1.copy();
        var spin3 = spin1.copy();

        item1.runAction(cc.RepeatForever.actionWithAction(spin1));
        item2.runAction(cc.RepeatForever.actionWithAction(spin2));
        item3.runAction(cc.RepeatForever.actionWithAction(spin3));

        this.addChild(menu);
    },
    menuCallback:function (sender) {
        this._m_pParent.switchTo(0);
    },
    menuCallback2:function (sender) {
        this._m_disabledItem.setIsEnabled(!this._m_disabledItem.getIsEnabled());
        this._m_disabledItem.stopAllActions();
    },
    menuCallback3:function () {
        cc.LOG("do something")
    }
});

var MenuLayer4 = cc.Layer.extend({
    ctor:function () {
        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);

        var title1 = cc.MenuItemFont.itemFromString("Sound");
        title1.setIsEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item1 = cc.MenuItemToggle.itemWithTarget(this,
            this.menuCallback,
            cc.MenuItemFont.itemFromString("On"),
            cc.MenuItemFont.itemFromString("Off"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title2 = cc.MenuItemFont.itemFromString("Music");
        title2.setIsEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item2 = cc.MenuItemToggle.itemWithTarget(this,
            this.menuCallback,
            cc.MenuItemFont.itemFromString("On"),
            cc.MenuItemFont.itemFromString("Off"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title3 = cc.MenuItemFont.itemFromString("Quality");
        title3.setIsEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item3 = cc.MenuItemToggle.itemWithTarget(this,
            this.menuCallback,
            cc.MenuItemFont.itemFromString("High"),
            cc.MenuItemFont.itemFromString("Low"));

        cc.MenuItemFont.setFontName("American Typewriter");
        cc.MenuItemFont.setFontSize(18);
        var title4 = cc.MenuItemFont.itemFromString("Orientation");
        title4.setIsEnabled(false);
        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);
        var item4 = cc.MenuItemToggle.itemWithTarget(this,
            this.menuCallback,
            cc.MenuItemFont.itemFromString("Off"));

        item4.getSubItems().push(cc.MenuItemFont.itemFromString("33%"));
        item4.getSubItems().push(cc.MenuItemFont.itemFromString("66%"));
        item4.getSubItems().push(cc.MenuItemFont.itemFromString("100%"));

        // you can change the one of the items by doing this
        item4.setSelectedIndex(2);

        cc.MenuItemFont.setFontName("Marker Felt");
        cc.MenuItemFont.setFontSize(34);

        //var label = cc.LabelBMFont.labelWithString("go back", "Resources/fonts/bitmapFontTest3.fnt");
        var label = cc.LabelTTF.labelWithString("go back","Arial",28);
        var back = cc.MenuItemLabel.itemWithLabel(label, this, this.backCallback);

        var menu = cc.Menu.menuWithItems(
            title1, title2,
            item1, item2,
            title3, title4,
            item3, item4,
            back); // 9 items.

        menu.alignItemsInColumns(2, 2, 2, 2, 1, null);

        this.addChild(menu);
    },
    menuCallback:function () {
    },
    backCallback:function (sender) {
        this._m_pParent.switchTo(0);
    }
});

var MenuTestScene = TestScene.extend({
    runThisTest:function () {
        var Layer1 = new MenuLayer1();
        var Layer2 = new MenuLayer2();
        var Layer3 = new MenuLayer3();
        var Layer4 = new MenuLayer4();

        var layer = cc.LayerMultiplex.layerWithLayers(Layer1, Layer2, Layer3, Layer4, null);
        this.addChild(layer, 0);
        cc.Director.sharedDirector().replaceScene(this);
    }
});