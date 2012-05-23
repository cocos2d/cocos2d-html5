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
var kHighPlayer = 0;
var kLowPlayer = 1;
var kStatusBarHeight = 20.0;
var kSpriteTag = 0;

var TouchesTestScene = TestScene.extend({
    ctor:function () {
        this._super(true);
        var pongLayer = new PongLayer();
        this.addChild(pongLayer);
    },
    runThisTest:function () {
        cc.Director.sharedDirector().replaceScene(this);
    },
    MainMenuCallback:function (pSender) {
        cc.Director.sharedDirector().setDeviceOrientation(cc.DeviceOrientationPortrait);
        this._super(pSender);
    }
});

var PongLayer = cc.Layer.extend({
    _ball:null,
    _paddles:[],
    _ballStartingVelocity:cc.PointZero(),
    _winSize:null,

    ctor:function () {
        this._ballStartingVelocity = cc.PointMake(20.0, -100.0);
        this._winSize = cc.Director.sharedDirector().getWinSize();

        this._ball = Ball.ballWithTexture(cc.TextureCache.sharedTextureCache().addImage(s_Ball));
        this._ball.setPosition(cc.PointMake(this._winSize.width /2, this._winSize.height /2));
        this._ball.setVelocity(this._ballStartingVelocity);
        this.addChild(this._ball);

        var paddleTexture = cc.TextureCache.sharedTextureCache().addImage(s_Paddle);

        this._paddles = [];

        var paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(this._winSize.width/2, 15));
        this._paddles.push(paddle);

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(this._winSize.width/2, this._winSize.height - kStatusBarHeight - 15));
        this._paddles.push(paddle);

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(this._winSize.width/2, 100));
        this._paddles.push(paddle);

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(this._winSize.width/2, this._winSize.height - kStatusBarHeight - 100));
        this._paddles.push(paddle);

        for (var i = 0; i < this._paddles.length; i++) {
            if (!this._paddles[i])
                break;

            this.addChild(this._paddles[i]);
        }

        this.schedule(this.doStep);
    },
    resetAndScoreBallForPlayer:function (player) {
        if (Math.abs(this._ball.getVelocity().y) < 300) {
            this._ballStartingVelocity = cc.ccpMult(this._ballStartingVelocity, -1.1);
        } else {
            this._ballStartingVelocity = cc.ccpMult(this._ballStartingVelocity, -1);
        }
        this._ball.setVelocity(this._ballStartingVelocity);
        this._ball.setPosition(cc.PointMake(this._winSize.width /2, this._winSize.height /2));

        // TODO -- scoring
    },
    doStep:function (delta) {
        this._ball.move(delta);

        for (var i = 0; i < this._paddles.length; i++) {
            if (!this._paddles[i])
                break;

            this._ball.collideWithPaddle(this._paddles[i]);
        }

        if (this._ball.getPosition().y > this._winSize.height - kStatusBarHeight + this._ball.radius())
            this.resetAndScoreBallForPlayer(kLowPlayer);
        else if (this._ball.getPosition().y < -this._ball.radius())
            this.resetAndScoreBallForPlayer(kHighPlayer);
        this._ball.draw();
    }
});
