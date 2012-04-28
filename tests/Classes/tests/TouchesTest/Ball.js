var Ball = cc.Sprite.extend({
    _velocity:cc.PointZero(),
    _radius:0,
    radius:function () {
        return this._radius;
    },
    setRadius:function (rad) {
        this._radius = rad;
    },
    move:function (delta) {
        this.setPosition(cc.ccpAdd(this.getPosition(), cc.ccpMult(this._velocity, delta)));

        if (this.getPosition().x > 320 - this.radius()) {
            this.setPosition(cc.ccp(320 - this.radius(), this.getPosition().y));
            this._velocity.x *= -1;
        } else if (this.getPosition().x < this.radius()) {
            this.setPosition(cc.ccp(this.radius(), this.getPosition().y));
            this._velocity.x *= -1;
        }
    },
    collideWithPaddle:function (paddle) {
        var paddleRect = paddle.rect();

        paddleRect.origin.x += paddle.getPosition().x;
        paddleRect.origin.y += paddle.getPosition().y;

        var lowY = cc.Rect.CCRectGetMinY(paddleRect);
        var midY = cc.Rect.CCRectGetMidY(paddleRect);
        var highY = cc.Rect.CCRectGetMaxY(paddleRect);

        var leftX = cc.Rect.CCRectGetMinX(paddleRect);
        var rightX = cc.Rect.CCRectGetMaxX(paddleRect);

        if ((this.getPosition().x > leftX) && (this.getPosition().x < rightX)) {
            var hit = false;
            var angleOffset = 0.0;
            if ((this.getPositionY() > midY) && (this.getPositionY() <= (highY + this.radius()))) {
                this.setPosition(cc.PointMake(this.getPosition().x, highY + this.radius()));
                hit = true;
                angleOffset = Math.PI / 2;
            } else if (this.getPosition().y < midY && this.getPosition().y >= lowY - this.radius()) {
                this.setPosition(cc.PointMake(this.getPosition().x, lowY - this.radius()));
                hit = true;
                angleOffset = -Math.PI / 2;
            }

            if (hit) {
                var hitAngle = cc.ccpToAngle(cc.ccpSub(paddle.getPosition(), this.getPosition())) + angleOffset;

                var scalarVelocity = cc.ccpLength(this._velocity) * 1.00000005;
                var velocityAngle = -cc.ccpToAngle(this._velocity) + 0.00000005 * hitAngle;
                //this._velocity = -this._velocity.y;
                this._velocity = cc.ccpMult(cc.ccpForAngle(velocityAngle), scalarVelocity);
                //cc.Log("Velocity:" + this._velocity.x + "     " + this._velocity.y);
            }
        }
    },
    setVelocity:function (velocity) {
        this._velocity = velocity;
    },
    getVelocity:function () {
        return this._velocity;
    }
});
Ball.ballWithTexture = function (texture) {
    var pBall = new Ball();
    pBall.initWithTexture(texture);
    if (texture instanceof cc.Texture2D)
        pBall.setRadius(texture.getContentSize().width / 2);
    else if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement))
        pBall.setRadius(texture.width / 2);
    return pBall;
};
