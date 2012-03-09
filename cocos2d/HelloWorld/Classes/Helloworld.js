/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-8

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


var Helloworld = CC.CCLayer.extend({
    // Here's a difference. Method 'init' in cocos2d-x returns bool, instead of returning 'id' in cocos2d-iphone
    init: function()
    {
        //////////////////////////////
        // 1. super init first
        var test = this._super();
        CC.CCLOG(test);
        if ( !test )
        {

            return false;
        }

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.

        // add a "close" icon to exit the progress. it's an autorelease object
        /*
        var pCloseItem = CC.CCMenuItemImage.itemFromNormalImage(
            "CloseNormal.png",
            "CloseSelected.png",
            this,
            CC.menu_selector(Helloworld.menuCloseCallback) );
        pCloseItem.setPosition( CC.ccp(CC.CCDirector.sharedDirector().getWinSize().width - 20, 20) );

        // create menu, it's an autorelease object
        var pMenu = CC.CCMenu.menuWithItems(pCloseItem, null);
        pMenu.setPosition( CC.CCPointZero );
        this.addChild(pMenu, 1);
        */
        /////////////////////////////
        // 3. add your codes below...

        // add a label shows "Hello World"
        // create and initialize a label
        //var pLabel = CC.CCLabelTTF.labelWithString("Hello World", "Arial", 24);
        // ask director the window size
        var size = CC.CCDirector.sharedDirector().getWinSize();

        // position the label on the center of the screen
        //pLabel.setPosition( CC.ccp(size.width / 2, size.height - 50) );

        // add the label as a child to this layer
        //this.addChild(pLabel, 1);

        // add "HelloWorld" splash screen"
        /*******************
        var pSprite = CC.CCSprite.spriteWithFile("HelloWorld.png");

        // position the sprite on the center of the screen
        pSprite.setPosition( CC.ccp(size.width/2, size.height/2) );

        // add the sprite as a child to this layer
        this.addChild(pSprite, 0);
        *******************/
        return true;
    },
    // a selector callback
    menuCloseCallback: function(pSender)
    {
        CC.CCDirector.sharedDirector().end();
    }
});
// there's no 'id' in cpp, so we recommand to return the exactly class pointer
Helloworld.scene = function(){
    // 'scene' is an autorelease object
    var scene = CC.CCScene.node();

    // 'layer' is an autorelease object
    var layer = this.node();
    scene.addChild(layer);
    return scene;
};
// implement the "static node()" method manually
Helloworld.node = function(){
    var pRet = new Helloworld();
    if(pRet && pRet.init())
    {
        return pRet;
    }
    else
    {
        pRet = null;
        return null;
    }
};

