var kHighPlayer = 0;
var kLowPlayer = 1;
var kStatusBarHeight = 20.0;
var kSpriteTag = 0;

var PongScene = TestScene.extend({
    ctor:function(){
        this._super(true);
        var pongLayer = new PongLayer();
        this.addChild(pongLayer);
    },
    runThisTest:function(){cc.Director.sharedDirector().replaceScene(this);},
    MainMenuCallback:function(pSender){
        cc.Director.sharedDirector().setDeviceOrientation(cc.DeviceOrientationPortrait);
        this._super(pSender);
    }
});

var PongLayer = cc.Layer.extend({
    _ball:null,
    _paddles:[],
    _ballStartingVelocity:cc.PointZero(),

    ctor:function(){
        this._ballStartingVelocity = cc.PointMake(20.0, -100.0);

        this._ball = Ball.ballWithTexture(cc.TextureCache.sharedTextureCache().addImage(s_Ball) );
        this._ball.setPosition(cc.PointMake(160.0, 240.0));
        this._ball.setVelocity(this._ballStartingVelocity);
        this.addChild(this._ball);

        var paddleTexture = cc.TextureCache.sharedTextureCache().addImage(s_Paddle);

        this._paddles = [];

        var paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition( cc.PointMake(160, 15) );
        this._paddles.push( paddle );

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(160, 480 - kStatusBarHeight - 15) );
        this._paddles.push( paddle );

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition( cc.PointMake(160, 100) );
        this._paddles.push( paddle );

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.setPosition(cc.PointMake(160, 480 - kStatusBarHeight - 100) );
        this._paddles.push(paddle);

        for(var i = 0; i< this._paddles.length;i++){
            if(!this._paddles[i])
                break;

            this.addChild(this._paddles[i]);
        }

        this.schedule(this.doStep);
    },
    resetAndScoreBallForPlayer:function(player){
        if(Math.abs(this._ball.getVelocity().y) < 300){
            this._ballStartingVelocity = cc.ccpMult(this._ballStartingVelocity, -1.1);
        }else{
            this._ballStartingVelocity = cc.ccpMult(this._ballStartingVelocity, -1);
        }
        this._ball.setVelocity( this._ballStartingVelocity);
        this._ball.setPosition( cc.PointMake(160.0, 240.0));

        // TODO -- scoring
    },
    doStep:function(delta){
        this._ball.move(delta);

        for(var i = 0; i< this._paddles.length;i++){
            if(!this._paddles[i])
                break;

            this._ball.collideWithPaddle(this._paddles[i]);
        }

        if (this._ball.getPosition().y > 480 - kStatusBarHeight + this._ball.radius())
            this.resetAndScoreBallForPlayer( kLowPlayer );
        else if (this._ball.getPosition().y < - this._ball.radius())
            this.resetAndScoreBallForPlayer( kHighPlayer );
        this._ball.draw();
    }
});
