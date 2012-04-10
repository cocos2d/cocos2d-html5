var kTagSprite = 1;

var ClickAndMoveTestScene = TestScene.extend({
    runThisTest:function(){
        var pLayer = new MainLayer();

        this.addChild(pLayer);
        cc.Director.sharedDirector().replaceScene(this);
    }
});

var MainLayer = cc.Layer.extend({
    ctor:function(){
        this.setIsTouchEnabled(true);
        var sprite = cc.Sprite.spriteWithFile(s_pPathGrossini);

        var layer = cc.LayerColor.layerWithColor(cc.ccc4(255,255,0,100));
        this.addChild(layer, -1);

        this.addChild(sprite, 0, kTagSprite);
        sprite.setPosition( cc.PointMake(20,150) );

        sprite.runAction( cc.JumpTo.actionWithDuration(4, cc.PointMake(300,48), 100, 4) );

        var fadeIn = cc.FadeIn.actionWithDuration(1);
        var fadeOut = cc.FadeOut.actionWithDuration(1);
        var forever = cc.RepeatForever.actionWithAction(cc.Sequence.actions(fadeIn,fadeOut));
        layer.runAction(forever);
    },

    ccTouchesEnded:function(pTouches,pEvent){
        if(pTouches.length<=0)
            return;

        var touch = pTouches[0];

        var location = touch.locationInView( touch.view() );
        //var convertedLocation = cc.Director.sharedDirector().convertToGL(location);

        var sprite = this.getChildByTag(kTagSprite);
        sprite.stopAllActions();
        sprite.runAction( cc.MoveTo.actionWithDuration(1, cc.PointMake(location.x, location.y) ) );
        var o = location.x - sprite.getPositionX();
        var a = location.y - sprite.getPositionY();
        var at = cc.RADIANS_TO_DEGREES( Math.atan( o/a) );

        if( a < 0 ){
            if(  o < 0 )
                at = 180 + Math.abs(at);
            else
                at = 180 - Math.abs(at);
        }
        at = at %360;

        sprite.runAction(cc.RotateTo.actionWithDuration(1, at));
    }
});