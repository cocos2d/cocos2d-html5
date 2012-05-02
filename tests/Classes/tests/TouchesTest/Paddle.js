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
var kPaddleStateGrabbed = 0;
var kPaddleStateUngrabbed = 1;

var Paddle = cc.Sprite.extend({
    _state:kPaddleStateUngrabbed,
    _rect:null,

    rect:function () {
        return cc.RectMake(-this._rect.size.width / 2, -this._rect.size.height / 2, this._rect.size.width, this._rect.size.height);
    },
    initWithTexture:function (aTexture) {
        if (this._super(aTexture)) {
            this._state = kPaddleStateUngrabbed;
        }
        if (aTexture instanceof cc.Texture2D) {
            var s = aTexture.getContentSize();
            this._rect = cc.RectMake(0, 0, s.width, s.height);
        } else if ((aTexture instanceof HTMLImageElement) || (aTexture instanceof HTMLCanvasElement)) {
            this._rect = cc.RectMake(0, 0, aTexture.width, aTexture.height);
        }
        return true;
    },
    onEnter:function () {
        cc.TouchDispatcher.sharedDispatcher().addTargetedDelegate(this, 0, true);
        this._super();
    },
    onExit:function () {
        cc.TouchDispatcher.sharedDispatcher().removeDelegate(this);
        this._super();
    },
    containsTouchLocation:function (touch) {
        var getPoint = touch.locationInView(touch.view());
        var myRect = this.rect();

        myRect.origin.x += this.getPosition().x;
        myRect.origin.y += this.getPosition().y;
        return cc.Rect.CCRectContainsPoint(myRect, getPoint);//this.convertTouchToNodeSpaceAR(touch));
    },

    ccTouchBegan:function (touch, event) {
        if (this._state != kPaddleStateUngrabbed) return false;
        if (!this.containsTouchLocation(touch)) return false;

        this._state = kPaddleStateGrabbed;
        return true;
    },
    ccTouchMoved:function (touch, event) {
        // If it weren't for the TouchDispatcher, you would need to keep a reference
        // to the touch from touchBegan and check that the current touch is the same
        // as that one.
        // Actually, it would be even more complicated since in the Cocos dispatcher
        // you get CCSets instead of 1 UITouch, so you'd need to loop through the set
        // in each touchXXX method.
        cc.Assert(this._state == kPaddleStateGrabbed, "Paddle - Unexpected state!");

        var touchPoint = touch.locationInView(touch.view());
        //touchPoint = cc.Director.sharedDirector().convertToGL( touchPoint );

        this.setPosition(cc.PointMake(touchPoint.x, this.getPosition().y));
    },
    ccTouchEnded:function (touch, event) {
        cc.Assert(this._state == kPaddleStateGrabbed, "Paddle - Unexpected state!");
        this._state = kPaddleStateUngrabbed;
    },
    touchDelegateRetain:function () {
    },
    touchDelegateRelease:function () {
    }
});
Paddle.paddleWithTexture = function (aTexture) {
    var pPaddle = new Paddle();
    pPaddle.initWithTexture(aTexture);

    return pPaddle;
};