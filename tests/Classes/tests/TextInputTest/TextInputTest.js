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

var kTextFieldTTFDefaultTest = 0;
var kTextFieldTTFActionTest = 1;
var kTextInputTestsCount = 2;

var textInput_FONT_NAME = "Thonburi";
var textInput_FONT_SIZE = 36;

var inputTestIdx = -1;

var createTextInputTest = function (nIndex) {
    switch (nIndex) {
        case kTextFieldTTFDefaultTest:
            return new TextFieldTTFDefaultTest();
        case kTextFieldTTFActionTest:
            return new TextFieldTTFActionTest();
        default:
            return 0;
    }
};

var restartTextInputTest = function () {
    var pContainerLayer = new TextInputTest();

    var pTestLayer = createTextInputTest(inputTestIdx);
    pContainerLayer.addKeyboardNotificationLayer(pTestLayer);

    return pContainerLayer;
};

var nextTextInputTest = function () {
    inputTestIdx++;
    inputTestIdx = inputTestIdx % kTextInputTestsCount;

    return restartTextInputTest();
};

var backTextInputTest = function () {
    inputTestIdx--;
    if (inputTestIdx < 0)
        inputTestIdx += kTextInputTestsCount;

    return restartTextInputTest();
};

var textInputGetRect = function (pNode) {
    var rc = new cc.Rect(pNode.getPosition().x, pNode.getPosition().y, pNode.getContentSize().width, pNode.getContentSize().height);
    rc.origin.x -= rc.size.width / 2;
    rc.origin.y -= rc.size.height / 2;
    return rc;
};

/**
 @brief    TextInputTest for retain prev, reset, next, main menu buttons.
 */
var TextInputTest = cc.Layer.extend({
    m_pNotificationLayer:null,
    ctor:function () {
    },

    restartCallback:function (pSender) {
        var s = new TextInputTestScene();
        s.addChild(restartTextInputTest());
        cc.Director.sharedDirector().replaceScene(s);
    },
    nextCallback:function (pSender) {
        var s = new TextInputTestScene();
        s.addChild(nextTextInputTest());
        cc.Director.sharedDirector().replaceScene(s);
    },
    backCallback:function (pSender) {
        var s = new TextInputTestScene();
        s.addChild(backTextInputTest());
        cc.Director.sharedDirector().replaceScene(s);
    },

    title:function () {
        return "text input test";
    },
    addKeyboardNotificationLayer:function (pLayer) {
        this.m_pNotificationLayer = pLayer;
        this.addChild(pLayer);
    },

    onEnter:function () {
        this._super();

        var s = cc.Director.sharedDirector().getWinSize();

        var label = cc.LabelTTF.labelWithString(this.title(), "Arial", 24);
        this.addChild(label);
        label.setPosition(new cc.Point(s.width / 2, s.height - 50));

        var subTitle = this.m_pNotificationLayer.subtitle();
        if (subTitle && subTitle != "") {
            var l = cc.LabelTTF.labelWithString(subTitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(new cc.Point(s.width / 2, s.height - 80));
        }

        var item1 = cc.MenuItemImage.itemFromNormalImage(s_pPathB1, s_pPathB2, this, this.backCallback);
        var item2 = cc.MenuItemImage.itemFromNormalImage(s_pPathR1, s_pPathR2, this, this.restartCallback);
        var item3 = cc.MenuItemImage.itemFromNormalImage(s_pPathF1, s_pPathF2, this, this.nextCallback);

        var menu = cc.Menu.menuWithItems(item1, item2, item3);
        menu.setPosition(cc.PointZero());
        item1.setPosition(new cc.Point(s.width / 2 - 100, 30));
        item2.setPosition(new cc.Point(s.width / 2, 30));
        item3.setPosition(new cc.Point(s.width / 2 + 100, 30));

        this.addChild(menu, 1);
    }
});

//////////////////////////////////////////////////////////////////////////
// KeyboardNotificationLayer for test IME keyboard notification.
//////////////////////////////////////////////////////////////////////////
var KeyboardNotificationLayer = cc.Layer.extend({
    _pTrackNode:null,
    _beginPos:null,

    ctor:function () {
        this.setIsTouchEnabled(true);
    },

    subtitle:function () {
        return "";
    },
    onClickTrackNode:function (bClicked) {
    },

    registerWithTouchDispatcher:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, false);
    },
    keyboardWillShow:function (info) {
        cc.Log("TextInputTest:keyboardWillShowAt(origin:" + info.end.origin.x + "," + info.end.origin.y
            + ", size:" + info.end.size.width + "," + info.end.size.height + ")");

        if (!this._pTrackNode) {
            return;
        }

        var rectTracked = textInputGetRect(this._pTrackNode);
        cc.Log("TextInputTest:trackingNodeAt(origin:" + info.end.origin.x + "," + info.end.origin.y
            + ", size:" + info.end.size.width + "," + info.end.size.height + ")");

        // if the keyboard area doesn't intersect with the tracking node area, nothing need to do.
        if (!cc.Rect.CCRectIntersectsRect(rectTracked, info.end)) {
            return;
        }

        // assume keyboard at the bottom of screen, calculate the vertical adjustment.
        var adjustVert = cc.Rect.CCRectGetMaxY(info.end) - cc.Rect.CCRectGetMinY(rectTracked);
        cc.Log("TextInputTest:needAdjustVerticalPosition(" + adjustVert + ")");

        // move all the children node of KeyboardNotificationLayer
        var children = this.getChildren();
        for (var i = 0; i < children.length; ++i) {
            var node = children[i];
            var pos = node.getPosition();
            pos.y += adjustVert;
            node.setPosition(pos);
        }
    },

    ccTouchBegan:function (pTouch, pEvent) {
        cc.Log("++++++++++++++++++++++++++++++++++++++++++++");
        this._beginPos = pTouch.locationInView(pTouch.view());
        this._beginPos = cc.Director.sharedDirector().convertToGL(this._beginPos);
        return true;
    },

    ccTouchEnded:function (pTouch, pEvent) {
        if (!this._pTrackNode) {
            return;
        }

        var endPos = pTouch.locationInView(pTouch.view());
        endPos = cc.Director.sharedDirector().convertToGL(endPos);

        var delta = 5.0;
        if (Math.abs(endPos.x - this._beginPos.x) > delta
            || Math.abs(endPos.y - this._beginPos.y) > delta) {
            // not click
            this._beginPos.x = this._beginPos.y = -1;
            return;
        }

        // decide the trackNode is clicked.
        var point = this.convertTouchToNodeSpaceAR(pTouch);
        //var point = endPos;
        cc.Log("KeyboardNotificationLayer:clickedAt(" + point.x + "," + point.y + ")");

        var rect = textInputGetRect(this._pTrackNode);
        cc.Log("KeyboardNotificationLayer:TrackNode at(origin:" + rect.origin.x + "," + rect.origin.y
            + ", size:" + rect.size.width + "," + rect.size.height + ")");

        this.onClickTrackNode(cc.Rect.CCRectContainsPoint(rect, point));
        cc.Log("----------------------------------");
    }
});

//////////////////////////////////////////////////////////////////////////
// TextFieldTTFDefaultTest for test TextFieldTTF default behavior.
//////////////////////////////////////////////////////////////////////////
var TextFieldTTFDefaultTest = KeyboardNotificationLayer.extend({
    subtitle:function () {
        return "TextFieldTTF with default behavior test";
    },
    onClickTrackNode:function (bClicked) {
        var pTextField = this._pTrackNode;
        if (bClicked) {
            // TextFieldTTFTest be clicked
            cc.Log("TextFieldTTFDefaultTest:CCTextFieldTTF attachWithIME");
            pTextField.attachWithIME();
        }
        else {
            // TextFieldTTFTest not be clicked
            cc.Log("TextFieldTTFDefaultTest:CCTextFieldTTF detachWithIME");
            pTextField.detachWithIME();
        }
    },

    onEnter:function () {
        this._super();

        // add CCTextFieldTTF
        var s = cc.Director.sharedDirector().getWinSize();

        var pTextField = cc.TextFieldTTF.textFieldWithPlaceHolder("<click here for input>",
            textInput_FONT_NAME,
            textInput_FONT_SIZE);
        this.addChild(pTextField);
        pTextField.setPosition(new cc.Point(s.width / 2, s.height / 2));

        this._pTrackNode = pTextField;
    }
});

//////////////////////////////////////////////////////////////////////////
// TextFieldTTFActionTest
//////////////////////////////////////////////////////////////////////////
var TextFieldTTFActionTest = KeyboardNotificationLayer.extend({
    _pTextField:null,
    _pTextFieldAction:null,
    _bAction:false,
    _nCharLimit:0, // the textfield max char limit

    ctor:function () {
        this._super();
    },

    callbackRemoveNodeWhenDidAction:function (pNode) {
        this.removeChild(pNode, true);
    },

    // KeyboardNotificationLayer
    subtitle:function () {
        return "CCTextFieldTTF with action and char limit test";
    },
    onClickTrackNode:function (bClicked) {
        var pTextField = this._pTrackNode;
        if (bClicked) {
            // TextFieldTTFTest be clicked
            cc.Log("TextFieldTTFActionTest:CCTextFieldTTF attachWithIME");
            pTextField.attachWithIME();
        } else {
            // TextFieldTTFTest not be clicked
            cc.Log("TextFieldTTFActionTest:CCTextFieldTTF detachWithIME");
            pTextField.detachWithIME();
        }
    },

    //CCLayer
    onEnter:function () {
        this._super();

        this._nCharLimit = 20;
        this._pTextFieldAction = cc.RepeatForever.actionWithAction(
            cc.Sequence.actions(
                cc.FadeOut.actionWithDuration(0.25),
                cc.FadeIn.actionWithDuration(0.25)));
        this._bAction = false;

        // add CCTextFieldTTF
        var s = cc.Director.sharedDirector().getWinSize();

        this._pTextField = cc.TextFieldTTF.textFieldWithPlaceHolder("<click here for input>",
            textInput_FONT_NAME,
            textInput_FONT_SIZE);
        this.addChild(this._pTextField);
        this._pTextField.setDelegate(this);

        this._pTextField.setPosition(new cc.Point(s.width / 2, s.height / 2));
        this._pTrackNode = this._pTextField;
    },
    onExit:function () {
        this._super();
    },

    //CCTextFieldDelegate
    onTextFieldAttachWithIME:function (pSender) {
        if (!this._bAction) {
            this._pTextField.runAction(this._pTextFieldAction);
            this._bAction = true;
        }
        return false;
    },
    onTextFieldDetachWithIME:function (pSender) {
        if (this._bAction) {
            this._pTextField.stopAction(this._pTextFieldAction);
            this._pTextField.setOpacity(255);
            this._bAction = false;
        }
        return false;
    },
    onTextFieldInsertText:function (pSender, text, nLen) {
        // if insert enter, treat as default to detach with ime
        if ('\n' == text) {
            return false;
        }

        // if the textfield's char count more than m_nCharLimit, doesn't insert text anymore.
        if (pSender.getCharCount() >= this._nCharLimit) {
            return true;
        }

        // create a insert text sprite and do some action
        var label = cc.LabelTTF.labelWithString(text, textInput_FONT_NAME, textInput_FONT_SIZE);
        this.addChild(label);
        var color = new cc.Color3B(226, 121, 7);
        label.setColor(color);

        // move the sprite from top to position
        var endPos = new cc.Point(pSender.getPositionX(), pSender.getPositionY());
        if (pSender.getCharCount()) {
            endPos.x += pSender.getContentSize().width / 2;
        }
        var inputTextSize = label.getContentSize();
        var beginPos = new cc.Point(endPos.x, cc.Director.sharedDirector().getWinSize().height - inputTextSize.height * 2);

        var duration = 0.5;
        label.setPosition(beginPos);
        label.setScale(8);

        var seq = cc.Sequence.actions(
            cc.Spawn.actions(
                cc.MoveTo.actionWithDuration(duration, endPos),
                cc.ScaleTo.actionWithDuration(duration, 1),
                cc.FadeOut.actionWithDuration(duration)),
            cc.CallFunc.actionWithTarget(this, this.callbackRemoveNodeWhenDidAction));
        label.runAction(seq);
        return false;
    },

    onTextFieldDeleteBackward:function (pSender, delText, nLen) {
        // create a delete text sprite and do some action
        var label = cc.LabelTTF.labelWithString(delText, textInput_FONT_NAME, textInput_FONT_SIZE);
        this.addChild(label);

        // move the sprite to fly out
        var beginPos = new cc.Point(pSender.getPositionX(), pSender.getPositionY());
        var textfieldSize = pSender.getContentSize();
        var labelSize = label.getContentSize();
        beginPos.x += (textfieldSize.width - labelSize.width) / 2.0;

        var winSize = cc.Director.sharedDirector().getWinSize();
        var endPos = new cc.Point(-winSize.width / 4.0, winSize.height * (0.5 + Math.random() / 2.0));

        var duration = 1;
        var rotateDuration = 0.2;
        var repeatTime = 5;
        label.setPosition(beginPos);

        var seq = cc.Sequence.actions(
            cc.Spawn.actions(
                cc.MoveTo.actionWithDuration(duration, endPos),
                cc.Repeat.actionWithAction(
                    cc.RotateBy.actionWithDuration(rotateDuration, (Math.random() % 2) ? 360 : -360),
                    repeatTime),
                cc.FadeOut.actionWithDuration(duration)),
            cc.CallFunc.actionWithTarget(this, this.callbackRemoveNodeWhenDidAction));
        label.runAction(seq);
        return false;
    },
    onDraw:function (pSender) {
        return false;
    }
});

var TextInputTestScene = TestScene.extend({
    runThisTest:function () {
        var pLayer = nextTextInputTest();
        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});