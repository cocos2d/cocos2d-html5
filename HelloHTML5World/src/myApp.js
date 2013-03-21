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
var TAG_SPRITE_MANAGER = 1;
var PTM_RATIO = 32;
var worldScale =30;
var b2BodyDef = Box2D.Dynamics.b2BodyDef
var b2Body = Box2D.Dynamics.b2Body
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2World = Box2D.Dynamics.b2World;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw
var LEFTKEY = 37;
var RIGHTKEY = 39;
var UPKEY = 38;
var DOWNKEY = 40;
var SPACEKEY = 32;
var world = null;
var TEXT_INPUT_FONT_NAME = "Arial";
var TEXT_INPUT_FONT_SIZE = 36;


var Helloworld = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,
    runIndex: null,
    jumpIndex:null,
    landingIndex:null,
    batch:null,
    screenSize:null,
    map:[],
    runPos:null,
    keyStatus: null,
    isFalling:false,
    jump:false,
    textField:null,
    debugDraw:null,

    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            function () {
                history.go(-1);
            },this);
        closeItem.setAnchorPoint(cc.p(0.5, 0.5));

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(cc.PointZero());
        this.addChild(menu, 1);
        closeItem.setPosition(cc.p(size.width - 20, 20));



        world = new b2World(new b2Vec2(0,-9.8), true);
        world.SetContinuousPhysics(true);


        //create the ground
        this._groundSprite = cc.Sprite.create();
        this._groundSprite.setColor(new cc.Color3B(255,0,0));
        this._groundSprite.setContentSize(cc.size(size.width,10))
        this._groundSprite.setPosition(size.width/2,10);
        this._groundSprite._rect = cc.RectMake(this._groundSprite.getPosition().x,this._groundSprite.getPosition().y, this._groundSprite.getContentSize().width, this._groundSprite.getContentSize().height);
        this._groundSprite.setTag(99);
        //this.addChild(this._groundSprite);

        //Player Body Box2d Physics Definition
        var m_groundBody = new b2BodyDef;
        m_groundBody.type = b2Body.b2_staticBody;
        m_groundBody.userData = this._groundSprite;

        //Position.Set sets the poistion of the box, this overrides the position in cocos2d, but can take the parameters of _position of the sprite object given when using setPosition in cocos2d
        m_groundBody.position.Set(this._groundSprite.getPosition().x/PTM_RATIO, this._groundSprite.getPosition().y/PTM_RATIO)
        var m_groundBody_Fixture = new b2FixtureDef;
        m_groundBody_Fixture.shape = new b2PolygonShape;

        //SetAsBox Takes the SIZE of the box devided by 2, therefore half the size of the box in both width and height
        m_groundBody_Fixture.shape.SetAsBox((this._groundSprite.getContentSize().width/2)/PTM_RATIO, (this._groundSprite.getContentSize().height/2)/PTM_RATIO);
        world.CreateBody(m_groundBody).CreateFixture(m_groundBody_Fixture);
        this._step = 1/100 ;

        // add CCTextFieldTTF
        var s = cc.Director.getInstance().getWinSize();

        var textLabel =  cc.LabelTTF.create("Please Type in your name", "Arial", 38);
        this.textField = cc.TextFieldTTF.create("<click here for input>",
            TEXT_INPUT_FONT_NAME,
            TEXT_INPUT_FONT_SIZE);
        this.addChild(this.textField);

        this.textField.setPosition(size.width/2,size.height/2);
        this.textField.attachWithIME()
        textLabel.setPosition(size.width/2, (size.height/2)+40);
        this.addChild(textLabel);

        var debugDraw = new b2DebugDraw;
        debugDraw.SetSprite(cc.renderContext);
        debugDraw.SetDrawScale(PTM_RATIO);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        var flipY = 7
        var flipX = -12.5
        debugDraw.SetOffsets({x:-12.5,y:7})
        world.SetDebugDraw(debugDraw);


        cc.log(cc.renderContext)

        this.scheduleUpdate();


        this.screenSize = cc.Director.getInstance().getWinSize();

        this.runPos = "right";
        this.map[RIGHTKEY] == false;
        this.map[LEFTKEY] = false;
        this.map[DOWNKEY] = false;
        this.map[UPKEY] = false;

        // add "HelloWorld" splash screen"
        //this.sprite = cc.Sprite.create("res/HelloWorld.png");

        var mgr = cc.SpriteBatchNode.create(s_spriteSheet, 20);
        this.addChild(mgr, 0, TAG_SPRITE_MANAGER);

        this.batch = this.getChildByTag(TAG_SPRITE_MANAGER);

        this.runIndex = 0;
        this.jumpIndex = 0;
//        this.sprite = cc.Sprite.createWithTexture(this.batch.getTexture(), cc.rect(1, 0, 25, 43));

        this.sprite = new player.create(this.batch.getTexture(), cc.rect(1, 0, 25, 43));

        this.batch.addChild(this.sprite);

        this.sprite.setPosition(cc.p(this.screenSize.width / 2, this.screenSize.height / 2));
        this.sprite.setBodyPhysics();


        var topTowerTexture = cc.TextureCache.getInstance().addImage("res/topTowerSprite.png");
        var bottomTowerTexture = cc.TextureCache.getInstance().addImage("res/bottomTowerSprite.png");
        var eggTexture = cc.TextureCache.getInstance().addImage("res/egg.png");

        var waterTower = new obstacles.createWaterTower(topTowerTexture,bottomTowerTexture, cc.p(200,this._groundSprite.getPosition().y+this._groundSprite.getContentSize().height/2))

        waterTower.setZOrder(-1);
        this.addChild(waterTower);

//        var egg = new obstacles.createWithSprite(eggTexture);
//        egg.setPosition(110+egg.getContentSize().width/2,this._groundSprite.getPosition().y+this._groundSprite.getContentSize().height/2+egg.getContentSize().height/2)
//        egg.setZOrder(-1)
//        this.addChild(egg);
//
//        var vert1 = new b2Vec2(egg.getPosition().x/PTM_RATIO, (egg.getPosition().y-egg.getContentSize().height/2)/PTM_RATIO);
//        var vert2 = new b2Vec2(vert1.x-(53/PTM_RATIO),vert1.y+(11/PTM_RATIO));
//        var vert3 = new b2Vec2(vert2.x-(48/PTM_RATIO),vert2.y+(40/PTM_RATIO));
//        var vert4 = new b2Vec2(vert3.x-(26/PTM_RATIO),vert3.y+(56/PTM_RATIO));
//        var vert5 = new b2Vec2(vert4.x-(7/PTM_RATIO),vert4.y+(56/PTM_RATIO));
//        var vert6= new b2Vec2(vert5.x+(12/PTM_RATIO),vert5.y+(67/PTM_RATIO));
//        var vert7 = new b2Vec2(vert6.x+(30/PTM_RATIO),vert6.y+(55/PTM_RATIO));
//        var vert8 = new b2Vec2(vert7.x+(49/PTM_RATIO),vert7.y+(36/PTM_RATIO));
//        var vert9 = new b2Vec2(vert8.x+(51/PTM_RATIO),vert8.y+(14/PTM_RATIO));
//        var vert10 = new b2Vec2(vert9.x+(40/PTM_RATIO),vert9.y-(8/PTM_RATIO));
//        var vert11 = new b2Vec2(vert10.x+(38/PTM_RATIO),vert10.y-(28/PTM_RATIO));
//        var vert12 = new b2Vec2(vert11.x+(25/PTM_RATIO),vert11.y-(28/PTM_RATIO));
//        var vert13 = new b2Vec2(vert12.x+(19/PTM_RATIO),vert12.y-(73/PTM_RATIO));
//        var vert14 = new b2Vec2(vert13.x+(12/PTM_RATIO),vert13.y-(49/PTM_RATIO));
//        var vert15 = new b2Vec2(vert14.x-(3/PTM_RATIO),vert14.y-(30/PTM_RATIO));
//        var vert16 = new b2Vec2(vert15.x-(3/PTM_RATIO),vert15.y-(43/PTM_RATIO));
//        var vert17 = new b2Vec2(vert16.x-(7/PTM_RATIO),vert16.y-(24/PTM_RATIO));
//        var vert18 = new b2Vec2(vert17.x-(11/PTM_RATIO),vert17.y-(22/PTM_RATIO));
//        var vert19 = new b2Vec2(vert18.x-(13/PTM_RATIO),vert18.y-(20/PTM_RATIO));
//        var vert20 = new b2Vec2(vert19.x-(16/PTM_RATIO),vert19.y-(18/PTM_RATIO));
//        var vert21 = new b2Vec2(vert20.x-(21/PTM_RATIO),vert20.y-(10/PTM_RATIO));
//        var vert22 = new b2Vec2(vert21.x-(23/PTM_RATIO),vert21.y-(10/PTM_RATIO));
//        var vert23 = new b2Vec2(vert22.x-(24/PTM_RATIO),vert22.y-(7/PTM_RATIO));
//
//        var verts = [vert1,vert2,vert3,vert4,vert5,vert6,vert7,vert8,vert9,vert9,vert10,vert11,vert12,vert13,vert14,vert15,vert16,vert17,vert18,vert19,vert20,vert21,vert22]
//        //cc.log(verts)


        //egg.setPhysicsWithVertices(verts, verts.length)
//        point 1 = 132.5,334.5
//        point2 = 81,325
//        point3 = 33.5,285.5
//        point4 = 7.0,229.5
//        point5 = 0, 172.5
//        point6 = 12,105
//        point7 = 42,50.5
//        point8 = 79.5,14
//        point9 = 130,0
//        point10 = 170.5,8.5
//        point11 = 208,36
//        point12 = 233,64
//        point13 = 252,97
//        point14 = 264,146
//        point15 = 267.5,176
//        point16 = 264,219.5
//        point17 = 257.5,243
//        point18 = 246,265
//        point19 = 233,285.5
//        point20 = 217,303
//        point21 = 196.5,318
//        point22 = 173,328.5
//        point23 = 149.5,335


//        var bottomWaterTower = new obstacles.createWithSprite(bottomTowerTexture);
//        bottomWaterTower.setPosition(110,this._groundSprite.getPosition().y+this._groundSprite.getContentSize().height/2+bottomWaterTower.getContentSize().height/2)
//        bottomWaterTower.setZOrder(-1)
//        this.addChild(bottomWaterTower);
//
//
//        var topWaterTower = new obstacles.createWithSprite(topTowerTexture);
//        topWaterTower.setPosition(new cc.p(bottomWaterTower.getPosition().x-1,bottomWaterTower.getPosition().y+bottomWaterTower.getContentSize().height/2+topWaterTower.getContentSize().height/2))
//        this.addChild(topWaterTower);
//        topWaterTower.setPhysics();


        //this.schedule(this.animationUpdate,2/ 60);

        this.setTouchEnabled(true);
        this.setKeyboardEnabled(true);
        this.setMouseEnabled(true);

        this.adjustSizeForWindow();
        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForWindow();
        });
        return true;
    },

    update:function(dt)
    {
        //It is recommended that a fixed time step is used with Box2D for stability
        //of the simulation, however, we are using a variable time step here.
        //You need to make an informed choice, the following URL is useful
        //http://gafferongames.com/game-physics/fix-your-timestep/
        var velocityIterations = 8;
        var positionIterations = 20;
        // Instruct the world to perform a single step of simulation. It is
        // generally best to keep the time step and iterations fixed.
        world.Step(dt, velocityIterations, positionIterations);

        //Iterate over the bodies in the physics world
        for (var b = world.GetBodyList(); b; b = b.GetNext()) {
            if (b.GetUserData() != null) {
                //Synchronize the AtlasSprites position and rotation with the corresponding body
                var myActor = b.GetUserData();
                myActor.setPosition(cc.p(b.GetPosition().x * PTM_RATIO, b.GetPosition().y * PTM_RATIO));
                myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));
                //cc.log(b.GetUserData());
                //console.log(b.GetAngle());
            }
        }
        world.DrawDebugData();
        world.ClearForces();


        this.statusCheck()
        this.checkFalling();
        //this.textField.attachWithIME();
    },

    statusCheck:function()
    {
        if(this.map[RIGHTKEY]  == true|| this.map[LEFTKEY] == true)
        {

            if(this.map[RIGHTKEY])
            {
                this.map[LEFTKEY] == false
                if(this.map[UPKEY] == true && this.jump == false)
                {
                    cc.log('UP & RIGHT')
                    var UpImpulse = this.sprite.getb2Body().GetMass()* 10;
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(0,5), this.sprite.getb2Body().GetWorldCenter())
                    this.jump = true;
                    //this.sprite.getb2Body().SetLinearVelocity(new b2Vec2(5,5));
                }
                else
                {
                    var vel = this.sprite.getb2Body().GetLinearVelocity();
                    var velChange = 5 - vel.x;
                    var forwardImpulse = this.sprite.getb2Body().GetMass()* velChange;
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(forwardImpulse,0), this.sprite.getb2Body().GetWorldCenter())
                    this.keyStatus = 2;
                }
            }
            else if(this.map[LEFTKEY] == true)
            {
                this.map[RIGHTKEY]== false;
                if(this.map[UPKEY] == true && this.jump == false)
                {
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(0,5), this.sprite.getb2Body().GetWorldCenter())
                    this.jump = true;
                    this.keyStatus = 3;
                }
                else
                {
                    var vel = this.sprite.getb2Body().GetLinearVelocity();
                    var velChange = -5 - vel.x;
                    var forwardImpulse = this.sprite.getb2Body().GetMass()* velChange;
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(forwardImpulse,0), this.sprite.getb2Body().GetWorldCenter())

                    this.keyStatus = 2;
                    this.keyStatus = 4;
                }
            }
        }
        else if(this.map[UPKEY] == true && this.jump == false)
        {
            if(this.map[RIGHTKEY] == true)
            {
                cc.log("Up && Right")
            }
            else
            {
                var UpImpulse = this.sprite.getb2Body().GetMass()* 10;
                this.sprite.getb2Body().ApplyImpulse(new b2Vec2(0,5), this.sprite.getb2Body().GetWorldCenter())
                this.jump = true;
                this.keyStatus = 5;
            }

        }
        if(this.sprite.getb2Body().GetLinearVelocity().y < 0)
        {
            this.isFalling = true;
        }
        else if(this.sprite.getb2Body().GetContactList() != null && this.sprite.getb2Body().GetContactList().other.GetUserData().getTag() == 99)
        {
            if(this.map[RIGHTKEY] == false && this.map[LEFTKEY] == false && this.map[UPKEY] == false)
            {
                this.sprite.getb2Body().ApplyImpulse(new b2Vec2(0,0), this.sprite.getb2Body().GetWorldCenter())
                this.sprite.getb2Body().SetLinearVelocity(new b2Vec2(0,0));
                this.isFalling = false;
                this.jump = false;
            }
        }
    },


    checkFalling:function()
    {
        //cc.log(this.sprite.getb2Body().GetLinearVelocity().y)
        if(this.sprite.getb2Body().GetLinearVelocity().y < -4 && this.isFalling == false)
        {
            this.batch.removeChild(this.sprite);
            this.isFalling = true;
            if(this.runPos == "right")
            {
                var startX = 100;
                var startY = 53;
                var endX = 22;
                var endY = 42;
            }
            else
            {
                var startX = 214;
                var startY = 633;
                var endX = 22;
                var endY = 42;
            }
            this.sprite = this.sprite.createWithTexture(this.batch.getTexture(), cc.rect(startX, startY, endX, endY));
            this.batch.addChild(this.sprite);

        }
        if(this.sprite.getb2Body().GetLinearVelocity().y == 0 && this.isFalling == true)
        {
            this.jumpIndex = 0;
            this.sprite.isJumping = false;
            this.isFalling = false;
            this.jump = false;
            this.batch.removeChild(this.sprite);
            if(this.runPos == "right")
            {
                this.sprite = this.sprite.createWithTexture(this.batch.getTexture(), cc.rect(1, 0, 25, 43));
                //this.sprite.setPosition(cc.p(prev.x,prev.y));
                this.batch.addChild(this.sprite);
            }
            else if(this.runPos == "left")
            {
                this.sprite = this.sprite.createWithTexture(this.batch.getTexture(), cc.rect(311, 582, 24, 42));
                //this.sprite.setPosition(cc.p(prev.x,prev.y));
                this.batch.addChild(this.sprite);
            }
        }


    },

    runAnimationUpdate:function(dt)
    {
        var prev = this.sprite.getPosition();

        if(this.runIndex != null)
        {

            if((this.map[RIGHTKEY] == true || this.map[LEFTKEY] == true))
            {
                //cc.log("vertical velocity is: "+this.sprite.getb2Body().GetLinearVelocity().y);

                if(this.map[RIGHTKEY] == true)
                {
                    //cc.log('here')
                    this.sprite.getb2Body().GetLinearVelocity().x = 5
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(1,0), this.sprite.getb2Body().GetWorldCenter())
                    if (this.sprite.isJumping == false && this.falling == false)
                    {
                        this.batch.removeChild(this.sprite);
                        this.sprite.runRightAnimation(this.batch.getTexture());
                        this.batch.addChild(this.sprite);
                    }
                    this.runPos = "right";

                }

                else if(this.map[LEFTKEY] == true)
                {
                    this.sprite.getb2Body().GetLinearVelocity().x = -5
                    this.sprite.getb2Body().ApplyImpulse(new b2Vec2(-1,0), this.sprite.getb2Body().GetWorldCenter())
                    if (this.sprite.isJumping == false && this.falling == false)
                    {
                        this.batch.removeChild(this.sprite);
                        this.sprite.runLeftAnimation(this.batch.getTexture());
                        this.batch.addChild(this.sprite);
                    }
                    this.runPos = "left";
                }

            }
            else if(this.map[RIGHTKEY] == false && this.map[LEFTKEY]==false)
            {
                this.sprite.getb2Body().GetLinearVelocity().x = 0;
                if (this.sprite.isJumping == false && this.isFalling == false)
                {
                    this.batch.removeChild(this.sprite);
                    if(this.runPos == "right")
                    {
                        this.sprite = this.sprite.createWithTexture(this.batch.getTexture(), cc.rect(1, 0, 25, 43));
                        //this.sprite.setPosition(cc.p(prev.x,prev.y));
                        this.batch.addChild(this.sprite);
                    }
                    else if(this.runPos == "left")
                    {
                        this.sprite = this.sprite.createWithTexture(this.batch.getTexture(), cc.rect(311, 582, 24, 42));
                        //this.sprite.setPosition(cc.p(prev.x,prev.y));
                        this.batch.addChild(this.sprite);
                    }
                    this.unschedule(this.runAnimationUpdate);
                }
            }
        }
    },

    jumpAnimationUpdate:function(dt)
    {
        if(this.runPos == "left")
        {
            if(this.isFalling == false)
            {
                if(this.sprite.jumpIndex < 3)
                {
                    this.sprite.jumpLeftAnimation(this.batch.getTexture());
                    this.batch.removeChild(this.sprite);
                    this.batch.addChild(this.sprite);
                }
                else
                {
                    this.unschedule(this.jumpAnimationUpdate);
                }
            }
        }
        else if(this.runPos == "right")
        {
            if(this.isFalling == false)
            {
                if(this.sprite.jumpIndex < 3)
                {
                    this.sprite.jumpRightAnimation(this.batch.getTexture());
                    this.batch.removeChild(this.sprite);
                    this.batch.addChild(this.sprite);
                }
                else
                {
                    this.unschedule(this.jumpAnimationUpdate);
                }
            }

        }

        this.sprite.isJumping = true;
    },


    adjustSizeForWindow:function () {
        var margin = document.documentElement.clientWidth - document.body.clientWidth;
        if (document.documentElement.clientWidth < cc.originalCanvasSize.width) {
            cc.canvas.width = cc.originalCanvasSize.width;
        } else {
            cc.canvas.width = document.documentElement.clientWidth - margin;
        }
        if (document.documentElement.clientHeight < cc.originalCanvasSize.height) {
            cc.canvas.height = cc.originalCanvasSize.height;
        } else {
            cc.canvas.height = document.documentElement.clientHeight - margin;
        }

        var xScale = cc.canvas.width / cc.originalCanvasSize.width;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }
        cc.canvas.width = cc.originalCanvasSize.width * xScale;
        cc.canvas.height = cc.originalCanvasSize.height * xScale;
        var parentDiv = document.getElementById("Cocos2dGameContainer");
        if (parentDiv) {
            parentDiv.style.width = cc.canvas.width + "px";
            parentDiv.style.height = cc.canvas.height + "px";
        }
        cc.renderContext.translate(0, cc.canvas.height);
        cc.renderContext.scale(xScale, xScale);
        cc.Director.getInstance().setContentScaleFactor(xScale);
    },
    // a selector callback
    menuCloseCallback:function (sender) {
        cc.Director.getInstance().end();
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
        cc.log(touches[0].getLocation().y/PTM_RATIO);
    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
            }
        }
    },
    onTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    },




    onKeyDown:function(e)
    {

        cc.log(e);
        if(e == RIGHTKEY)
        {
            this.map[RIGHTKEY] = true;
        }
        else if(e == LEFTKEY)
        {
            this.map[LEFTKEY] = true;
        }
        else if(e == UPKEY)
        {
            this.map[UPKEY] = true;
        }

    },

    onKeyUp:function(e)
    {
        if(e == RIGHTKEY)
        {
            this.map[RIGHTKEY] = false;
//            if(this.sprite.getb2Body().GetLinearVelocity().y == 0)
//            {
//                this.sprite.getb2Body().GetLinearVelocity().x = 0;
//            }

        }
        else if(e == LEFTKEY)
        {
            this.map[LEFTKEY] = false;
            if(this.sprite.getb2Body().GetLinearVelocity().y == 0)
            {
                this.sprite.getb2Body().GetLinearVelocity().x = 0;
            }

        }
        else if(e == UPKEY)
        {
            this.map[UPKEY] = false;
        }

    },
    draw:function(ctx)
    {
        world.DrawDebugData();
        this._super(ctx);
        cc.renderContext.textAlign = 'left';
    }




//
//    onKeyDown:function(e)
//    {
//       if(e == 39)
//       {
//           this.map[LEFTKEY] = false;
//           this.map[RIGHTKEY] = true;
//           this.schedule(this.runAnimationUpdate, 3/60);
//       }
//       else if(e == 37)
//       {
//
//           this.map[LEFTKEY] = true;
//           this.map[RIGHTKEY] = false;
//           this.schedule(this.runAnimationUpdate, 3/60);
//       }
//       else if(e == UPKEY)
//       {
//           if(this.sprite.isJumping == false)
//           {
//                this.sprite.getb2Body().GetLinearVelocity().y = 5;
//                this.sprite.getb2Body().ApplyImpulse(new b2Vec2(0,1), this.sprite.getb2Body().GetWorldCenter())
//                this.sprite.jumpIndex = 0;
//                this.schedule(this.jumpAnimationUpdate, 3/60);
//                this.sprite.isJumping = true;
//                this.map[UPKEY] = true;
//           }
//       }
//
//    },
//
//    onKeyUp:function(e)
//    {
//        if(e == 39)
//        {
//            this.map[RIGHTKEY] = false;
//            if(this.sprite.getb2Body().GetLinearVelocity().y == 0)
//            {
//                this.sprite.getb2Body().GetLinearVelocity().x = 0;
//            }
//
//        }
//        else if(e == 37)
//        {
//            this.map[LEFTKEY] = false;
//            if(this.sprite.getb2Body().GetLinearVelocity().y == 0)
//            {
//                this.sprite.getb2Body().GetLinearVelocity().x = 0;
//            }
//
//        }
//        else if(e == UPKEY)
//        {
//            this.map[UPKEY] = false;
//        }
//
//    }

});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        layer.init();
        this.addChild(layer);
    }
});

