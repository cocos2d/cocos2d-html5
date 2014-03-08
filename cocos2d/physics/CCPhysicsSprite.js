/** Copyright (c) 2012 Scott Lembcke and Howling Moon Software
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** A CCSprite subclass that is bound to a physics body.
 It works with:
 - Chipmunk: Preprocessor macro CC_ENABLE_CHIPMUNK_INTEGRATION should be defined
 - Objective-Chipmunk: Preprocessor macro CC_ENABLE_CHIPMUNK_INTEGRATION should be defined
 - Box2d: Preprocessor macro CC_ENABLE_BOX2D_INTEGRATION should be defined

 Features and Limitations:
 - Scale and Skew properties are ignored.
 - Position and rotation are going to updated from the physics body
 - If you update the rotation or position manually, the physics body will be updated
 - You can't eble both Chipmunk support and Box2d support at the same time. Only one can be enabled at compile time
 */
(function () {
    var box2dAPI = {
        _ignoreBodyRotation:false,
        _body:null,
        _PTMRatio:32,
        _rotation:1,
        setBody:function (body) {
            this._body = body;
        },
        getBody:function () {
            return this._body;
        },
        setPTMRatio:function (r) {
            this._PTMRatio = r;
        },
        getPTMRatio:function () {
            return this._PTMRatio;
        },
        getPosition:function () {
            var pos = this._body.GetPosition();
            var locPTMRatio =this._PTMRatio;
            return cc.p(pos.x * locPTMRatio, pos.y * locPTMRatio);
        },
        setPosition:function (p) {
            var angle = this._body.GetAngle();
            var locPTMRatio =this._PTMRatio;
            this._body.setTransform(Box2D.b2Vec2(p.x / locPTMRatio, p.y / locPTMRatio), angle);
            this.setNodeDirty();
        },
        getRotation:function () {
            return (this._ignoreBodyRotation ? cc.RADIANS_TO_DEGREES(this._rotationRadians) : cc.RADIANS_TO_DEGREES(this._body.GetAngle()));
        },
        setRotation:function (r) {
            if (this._ignoreBodyRotation) {
                this._rotation = r;
            } else {
                var locBody = this._body;
                var p = locBody.GetPosition();
                locBody.SetTransform(p, cc.DEGREES_TO_RADIANS(r));
            }
            this.setNodeDirty();
        },
        _syncPosition:function () {
            var pos = this._body.GetPosition();
            this._position.x = pos.x * this._PTMRatio;
            this._position.y = pos.y * this._PTMRatio;
            this._rotationRadians = this._rotation * (Math.PI / 180);
        },
        _syncRotation:function () {
            this._rotationRadians = this._body.GetAngle();
        },
        visit:function () {
            if (this._body && this._PTMRatio) {
                this._syncPosition();
                if (!this._ignoreBodyRotation)
                    this._syncRotation();
            }
            else {
                cc.log("PhysicsSprite body or PTIMRatio was not set");
            }
            this._super();
        },
        setIgnoreBodyRotation: function(b) {
            this._ignoreBodyRotation = b;
        }
    };
    var chipmunkAPI = {
        _ignoreBodyRotation:false,
        _body:null, //physics body
        _rotation:1,
        setBody:function (body) {
            this._body = body;
        },
        getBody:function () {
            return this._body;
        },
        getPosition:function () {
            var locBody = this._body;
            return {x:locBody.p.x, y:locBody.p.y};
        },

        getPositionX:function () {
            return this._body.p.x;
        },

        getPositionY:function () {
            return this._body.p.y;
        },

        setPosition:function (newPosOrxValue, yValue) {
            if (yValue === undefined) {
	            this._body.p.x = newPosOrxValue.x;
	            this._body.p.y = newPosOrxValue.y;
            } else {
	            this._body.p.x = newPosOrxValue;
	            this._body.p.y = yValue;
            }
            //this._syncPosition();
        },
	    setPositionX:function (xValue) {
		    this._body.p.x = xValue;
		    //this._syncPosition();
	    },
	    setPositionY:function (yValue) {
		    this._body.p.y = yValue;
		    //this._syncPosition();
	    },

        _syncPosition:function () {
            var locPosition = this._position, locBody = this._body;
            if (locPosition.x != locBody.p.x || locPosition.y != locBody.p.y) {
                cc.Sprite.prototype.setPosition.call(this, locBody.p.x, locBody.p.y);
            }
        },
        getRotation:function () {
            return this._ignoreBodyRotation ? cc.RADIANS_TO_DEGREES(this._rotationRadiansX) : -cc.RADIANS_TO_DEGREES(this._body.a);
        },
        setRotation:function (r) {
            if (this._ignoreBodyRotation) {
                cc.Sprite.prototype.setRotation.call(this, r);
            } else {
                this._body.a = -cc.DEGREES_TO_RADIANS(r);
                //this._syncRotation();
            }
        },
        _syncRotation:function () {
            if (this._rotationRadiansX != -this._body.a) {
                cc.Sprite.prototype.setRotation.call(this, -cc.RADIANS_TO_DEGREES(this._body.a));
            }
        },
        nodeToParentTransform:function () {
            if(cc._renderType === cc._RENDER_TYPE_CANVAS)
                return this._nodeToParentTransformForCanvas();

            var locBody = this._body, locAnchorPIP = this._anchorPointInPoints, locScaleX = this._scaleX, locScaleY = this._scaleY;
            var x = locBody.p.x;
            var y = locBody.p.y;

            if (this._ignoreAnchorPointForPosition) {
                x += locAnchorPIP.x;
                y += locAnchorPIP.y;
            }

            // Make matrix
            var radians = locBody.a;
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            // Although scale is not used by physics engines, it is calculated just in case
            // the sprite is animated (scaled up/down) using actions.
            // For more info see: http://www.cocos2d-iphone.org/forum/topic/68990
            if (!cc._rectEqualToZero(locAnchorPIP)) {
                x += c * -locAnchorPIP.x * locScaleX + -s * -locAnchorPIP.y * locScaleY;
                y += s * -locAnchorPIP.x * locScaleX + c * -locAnchorPIP.y * locScaleY;
            }

            // Rot, Translate Matrix
            this._transform = cc.AffineTransformMake(c * locScaleX, s * locScaleX,
                -s * locScaleY, c * locScaleY,
                x, y);

            return this._transform;
        },

        _nodeToParentTransformForCanvas: function () {
            if (this.dirty) {
                var t = this._transform;// quick reference
                // base position
                var locBody = this._body, locScaleX = this._scaleX, locScaleY = this._scaleY, locAnchorPIP = this._anchorPointInPoints;
                t.tx = locBody.p.x;
                t.ty = locBody.p.y;

                // rotation Cos and Sin
                var radians = -locBody.a;
                var Cos = 1, Sin = 0;
                if (radians) {
                    Cos = Math.cos(radians);
                    Sin = Math.sin(radians);
                }

                // base abcd
                t.a = t.d = Cos;
                t.b = -Sin;
                t.c = Sin;

                // scale
                if (locScaleX !== 1 || locScaleY !== 1) {
                    t.a *= locScaleX;
                    t.c *= locScaleX;
                    t.b *= locScaleY;
                    t.d *= locScaleY;
                }

                // adjust anchorPoint
                t.tx += Cos * -locAnchorPIP.x * locScaleX + -Sin * locAnchorPIP.y * locScaleY;
                t.ty -= Sin * -locAnchorPIP.x * locScaleX + Cos * locAnchorPIP.y * locScaleY;

                // if ignore anchorPoint
                if (this._ignoreAnchorPointForPosition) {
                    t.tx += locAnchorPIP.x;
                    t.ty += locAnchorPIP.y;
                }
                this._transformDirty = false;
            }
            return this._transform;
        },

        isDirty:function(){
           return !this._body.isSleeping();
        },
        setDirty: function(){ },

        setIgnoreBodyRotation: function(b) {
            this._ignoreBodyRotation = b;
        }
    };
    cc.PhysicsSprite = cc.Sprite.extend(chipmunkAPI);
    cc.PhysicsSprite._className = "PhysicsSprite";
	window._p = cc.PhysicsSprite.prototype;
	// Extended properties
	/** @expose */
	_p.body;
	cc.defineGetterSetter(_p, "body", _p.getBody, _p.setBody);
    /** @expose */
    _p.dirty;
    cc.defineGetterSetter(_p, "dirty", _p.isDirty, _p.setDirty);
	delete window._p;

    /**
     * Create a PhysicsSprite with filename and rect
     * @constructs
     * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
     * @param {cc.Rect} rect
     * @return {cc.PhysicsSprite}
     * @example
     *
     * 1.Create a sprite with image path and rect
     * var physicsSprite1 = cc.PhysicsSprite.create("res/HelloHTML5World.png");
     * var physicsSprite2 = cc.PhysicsSprite.create("res/HelloHTML5World.png",cc.rect(0,0,480,320));
     *
     * 2.Create a sprite with a sprite frame name. Must add "#" before fame name.
     * var physicsSprite = cc.PhysicsSprite.create('#grossini_dance_01.png');
     *
     * 3.Create a sprite with a sprite frame
     * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
     * var physicsSprite = cc.PhysicsSprite.create(spriteFrame);
     *
     * 4.Creates a sprite with an exsiting texture contained in a CCTexture2D object
     *      After creation, the rect will be the size of the texture, and the offset will be (0,0).
     * var texture = cc.textureCache.addImage("HelloHTML5World.png");
     * var physicsSprite1 = cc.PhysicsSprite.create(texture);
     * var physicsSprite2 = cc.PhysicsSprite.create(texture, cc.rect(0,0,480,320));
     *
     */
    cc.PhysicsSprite.create = function (fileName, rect) {
        var sprite = new cc.PhysicsSprite();

        if (arguments.length == 0) {
            sprite.init();
            return sprite;
        }

        if (typeof(fileName) === "string") {
            if (fileName[0] === "#") {
                //init with a sprite frame name
                var frameName = fileName.substr(1, fileName.length - 1);
                var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
                if (sprite.initWithSpriteFrame(spriteFrame))
                    return sprite;
            } else {
                //init  with filename and rect
                if (sprite.init(fileName, rect))
                    return  sprite;
            }
            return null;
        }

        if (typeof(fileName) === "object") {
            if (fileName instanceof cc.Texture2D) {
                //init  with texture and rect
                if (sprite.initWithTexture(fileName, rect))
                    return  sprite;
            } else if (fileName instanceof cc.SpriteFrame) {
                //init with a sprite frame
                if (sprite.initWithSpriteFrame(fileName))
                    return sprite;
            }
            return null;
        }

        return null;
    };
})();
