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
        } else if (aTexture instanceof HTMLImageElement) {
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