/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

/**
 * Timeline Frame.
 * base class
 * @class
 */
ccs.Frame = ccs.Class.extend({

    _frameIndex: null,
    _tween: null,
    _timeline: null,
    _node: null,

    ctor: function(){
        this._frameIndex = 0;
        this._tween = true;
        this._timeline = null;
        this._node = null;
    },

    _emitEvent: function(){
        if (this._timeline){
            this._timeline.getActionTimeline()._emitFrameEvent(this);
        }
    },

    _cloneProperty: function(frame){
        this._frameIndex = frame.getFrameIndex();
        this._tween = frame.isTween();
    },

    /**
     * Set the frame index
     * @param {number} frameIndex
     */
    setFrameIndex: function(frameIndex){
        this._frameIndex = frameIndex;
    },

    /**
     * Get the frame index
     * @returns {null}
     */
    getFrameIndex: function(){
        return this._frameIndex;
    },

    /**
     * Set timeline
     * @param timeline
     */
    setTimeline: function(timeline){
        this._timeline = timeline;
    },

    /**
     * Get timeline
     * @param timeline
     * @returns {ccs.timeline}
     */
    getTimeline: function(timeline){
        return this._timeline;
    },

    /**
     * Set Node
     * @param node
     */
    setNode: function(node){
        this._node = node;
    },

    /**
     * set tween
     * @param tween
     */
    setTween: function(tween){
        this._tween = tween;
    },

    /**
     * Gets the tween
     * @returns {boolean | null}
     */
    isTween: function(){
        return this._tween;
    },

    onEnter: function(nextFrame){ // = 0
    },

    apply: function(percent){
    },

    clone: function(){ // = 0
    }
});

ccs.VisibleFrame = ccs.Frame.extend({

    _visible: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._visible = true;
    },

    onEnter: function(nextFrame){
        this._node.setVisible(this._visible);
    },

    clone: function(){
        var frame = new ccs.VisibleFrame();
        frame.setVisible(this._visible);

        frame._cloneProperty(this);

        return frame;
    },

    setVisible: function(visible){
        this._visible = visible;
    },

    isVisible: function(){
        return this._visible;
    }

});

ccs.VisibleFrame.create = function(){
    return new ccs.VisibleFrame();
};

ccs.TextureFrame = ccs.Frame.extend({

    _sprite: null,
    _textureName: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);

        this._textureName = "";
    },

    setNode: function(node){
        ccs.Frame.prototype.setNode.call(this, node);
        this._sprite = node;
    },

    onEnter: function(nextFrame){
        if(this._sprite){
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(this._textureName);

            if(spriteFrame != null)
                this._sprite.setSpriteFrame(spriteFrame);
            else
                this._sprite.setTexture(this._textureName);
        }

    },

    clone: function(){
        var frame = new ccs.TextureFrame();
        frame.setTextureName(this._textureName);
        frame._cloneProperty(this);
        return frame;
    },

    setTextureName: function(textureName){
        this._textureName = textureName;
    },

    getTextureName: function(){
        return this._textureName;
    }

});

ccs.TextureFrame.create = function(){
    return new ccs.TextureFrame();
};

ccs.RotationFrame = ccs.Frame.extend({

    _rotation: null,
    _betwennRotation: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._rotation = 0;
    },

    onEnter: function(nextFrame){
        this._node.setRotation(this._rotation);

        if(this._tween){
            this._betwennRotation = nextFrame._rotation - this._rotation;
        }
    },

    apply: function(percent){
        if (this._tween && this._betwennRotation != 0){
            var rotation = this._rotation + percent * this._betwennRotation;
            this._node.setRotation(rotation);
        }
    },

    clone: function(){
        var frame = new ccs.RotationFrame();
        frame.setRotation(this._rotation);

        frame._cloneProperty(this);

        return frame;
    },

    setRotation: function(rotation){
        this._rotation = rotation;
    },

    getRotation: function(){
        return this._rotation;
    }

});

ccs.RotationFrame.create = function(){
    return new ccs.RotationFrame();
};

ccs.SkewFrame = ccs.Frame.extend({

    _skewX: null,
    _skewY: null,
    _betweenSkewX: null,
    _betweenSkewY: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._skewX = 0;
        this._skewY = 0;
    },

    onEnter: function(nextFrame){
        this._node.setSkewX(this._skewX);
        this._node.setSkewY(this._skewY);

        if(this._tween){
            this._betweenSkewX = nextFrame._skewX - this._skewX;
            this._betweenSkewY = nextFrame._skewY - this._skewY;
        }

    },

    apply: function(percent){
        if (this._tween && (this._betweenSkewX != 0 || this._betweenSkewY != 0))
        {
            var skewx = this._skewX + percent * this._betweenSkewX;
            var skewy = this._skewY + percent * this._betweenSkewY;

            this._node.setSkewX(skewx);
            this._node.setSkewY(skewy);
        }
    },

    clone: function(){
        var frame = new ccs.SkewFrame();
        frame.setSkewX(this._skewX);
        frame.setSkewY(this._skewY);

        frame._cloneProperty(this);

        return frame;
    },

    setSkewX: function(skewx){
        this._skewX = skewx;
    },

    getSkewX: function(){
        return this._skewX;
    },

    setSkewY: function(skewy){
        this._skewY = skewy;
    },

    getSkewY: function(){
        return this._skewY;
    }

});

ccs.SkewFrame.create = function(){
    return new ccs.SkewFrame();
};

ccs.RotationSkewFrame = ccs.SkewFrame.extend({

    onEnter: function(nextFrame){

        this._node.setRotationX(this._skewX);
        this._node.setRotationY(this._skewY);

        if (this._tween)
        {
            this._betweenSkewX = nextFrame._skewX - this._skewX;
            this._betweenSkewY = nextFrame._skewY - this._skewY;
        }

    },

    apply: function(percent){
        if (this._tween && (this._betweenSkewX != 0 || this._betweenSkewY != 0)){
            var skewx = this._skewX + percent * this._betweenSkewX;
            var skewy = this._skewY + percent * this._betweenSkewY;

            this._node.setRotationX(skewx);
            this._node.setRotationY(skewy);
        }

    },

    clone: function(){
        var frame = new ccs.RotationSkewFrame();
        frame.setSkewX(this._skewX);
        frame.setSkewY(this._skewY);

        frame._cloneProperty(this);

        return frame;

    }

});

ccs.RotationSkewFrame.create = function(){
    return new ccs.RotationSkewFrame();
};

ccs.PositionFrame = ccs.Frame.extend({

    _position: null,
    _betweenX: null,
    _betweenY: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._position = cc.p(0, 0);
    },

    onEnter: function(nextFrame){
        this._node.setPosition(this._position);

        if(this._tween){
            this._betweenX = nextFrame._position.x - this._position.x;
            this._betweenY = nextFrame._position.y - this._position.y;
        }
    },

    apply: function(percent){
        if (this._tween && (this._betweenX != 0 || this._betweenY != 0)){
            var p = cc.p(0, 0);
            p.x = this._position.x + this._betweenX * percent;
            p.y = this._position.y + this._betweenY * percent;

            this._node.setPosition(p);
        }
    },

    clone: function(){
        var frame = new ccs.PositionFrame();
        frame.setPosition(this._position);

        frame._cloneProperty(this);

        return frame;
    },

    setPosition: function(position){
        this._position = position;
    },

    getPosition: function(){
        return this._position;
    },

    setX: function(x){
        this._position.x = x;
    },

    getX: function(){
        return this._position.x;
    },

    setY: function(y){
        this._position.y = y;
    },

    getY: function(){
        return this._position.y;
    }

});

ccs.PositionFrame.create = function(){
    return new ccs.PositionFrame();
};

ccs.ScaleFrame = ccs.Frame.extend({

    _scaleX: null,
    _scaleY: null,
    _betweenScaleX: null,
    _betweenScaleY: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._scaleX = 1;
        this._scaleY = 1;
    },

    onEnter: function(nextFrame){
        this._node.setScaleX(this._scaleX);
        this._node.setScaleY(this._scaleY);

        if(this._tween){
            this._betweenScaleX = nextFrame._scaleX - this._scaleX;
            this._betweenScaleY = nextFrame._scaleY - this._scaleY;
        }

    },

    apply: function(percent){
        if (this._tween && (this._betweenScaleX != 0 || this._betweenScaleY != 0)){
            var scaleX = this._scaleX + this._betweenScaleX * percent;
            var scaleY = this._scaleY + this._betweenScaleY * percent;

            this._node.setScaleX(scaleX);
            this._node.setScaleY(scaleY);
        }
    },

    clone: function(){
        var frame = new ccs.ScaleFrame();
        frame.setScaleX(this._scaleX);
        frame.setScaleY(this._scaleY);

        frame._cloneProperty(this);

        return frame;

    },

    setScale: function(scale){
        this._scaleX = scale;
        this._scaleY = scale;
    },

    setScaleX: function(scaleX){
        this._scaleX = scaleX;
    },

    getScaleX: function(){
        return this._scaleX;
    },

    setScaleY: function(scaleY){
        this._scaleY = scaleY;
    },

    getScaleY: function(){
        return this._scaleY;
    }

});

ccs.ScaleFrame.create = function(){
    return new ccs.ScaleFrame();
};

ccs.AnchorPointFrame = ccs.Frame.extend({

    _anchorPoint: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._anchorPoint = cc.p(0, 0);
    },

    onEnter: function(nextFrame){
        this._node.setAnchorPoint(this._anchorPoint);
    },

    clone: function(){
        var frame = new ccs.AnchorPointFrame();
        frame.setAnchorPoint(this._anchorPoint);

        frame._cloneProperty(this);

        return frame;
    },

    setAnchorPoint: function(point){
        this._anchorPoint = point;
    },

    getAnchorPoint: function(){
        return this._anchorPoint;
    }

});

ccs.AnchorPointFrame.create = function(){
    return new ccs.AnchorPointFrame();
};

ccs.InnerActionType = {
    LoopAction : 0,
    NoLoopAction : 1,
    SingleFrame : 2
};

ccs.InnerActionFrame = ccs.Frame.extend({

    _innerActionType: null,
    _startFrameIndex: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);

        this._innerActionType = ccs.InnerActionType.LoopAction;
        this._startFrameIndex = 0;
    },

    onEnter: function(nextFrame){
        //override
    },

    clone: function(){
        var frame = new ccs.InnerActionFrame();
        frame.setInnerActionType(this._innerActionType);
        frame.setStartFrameIndex(this._startFrameIndex);

        frame._cloneProperty(this);

        return frame;

    },

    setInnerActionType: function(type){
        this._innerActionType = type;
    },

    getInnerActionType: function(){
        return this._innerActionType;
    },

    setStartFrameIndex: function(frameIndex){
        this._startFrameIndex = frameIndex;
    },

    getStartFrameIndex: function(){
        return this._startFrameIndex;
    }

});

ccs.InnerActionFrame.create = function(){
    return new ccs.InnerActionFrame();
};

ccs.ColorFrame = ccs.Frame.extend({

    _alpha: null,
    _color: null,

    _betweenAlpha: null,
    _betweenRed: null,
    _betweenGreen: null,
    _betweenBlue: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);

        this._alpha = 255;
        this.color = cc.color(255, 255, 255);
    },

    onEnter: function(nextFrame){
        this._node.setOpacity(this._alpha);
        this._node.setColor(this._color);

        if(this._tween){
            this._betweenAlpha = nextFrame._alpha - this._alpha;

            var color = nextFrame._color;
            this._betweenRed   = color.r - this._color.r;
            this._betweenGreen = color.g - this._color.g;
            this._betweenBlue  = color.b - this._color.b;
        }

    },

    apply: function(percent){
        if (this._tween && (this._betweenAlpha !=0 || this._betweenRed != 0 || this._betweenGreen != 0 || this._betweenBlue != 0))
        {
            var alpha = this._alpha + this._betweenAlpha * percent;

            var color = cc.color(255, 255, 255);
            color.r = this._color.r + this._betweenRed   * percent;
            color.g = this._color.g + this._betweenGreen * percent;
            color.b = this._color.b + this._betweenBlue  * percent;

            this._node.setOpacity(alpha);
            this._node.setColor(color);
        }
    },

    clone: function(){
        var frame = new ccs.ColorFrame();
        frame.setAlpha(this._alpha);
        frame.setColor(this._color);

        frame._cloneProperty(this);

        return frame;
    },

    setAlpha: function(alpha){
        this._alpha = alpha;
    },

    getAlpha: function(){
        return this._alpha;
    },

    setColor: function(color){
        this._color = color;
    },

    getColor: function(){
        return this._color;
    }

});

ccs.ColorFrame.create = function(){
    return new ccs.ColorFrame();
};

ccs.EventFrame = ccs.Frame.extend({

    _event: null,

    ctor: function(){
        ccs.Frame.prototype.ctor.call(this);
        this._event = "";
    },

    onEnter: function(nextFrame){
        this._emitEvent();
    },

    clone: function(){
        var frame = new ccs.EventFrame();
        frame.setEvent(this._event);

        frame._cloneProperty(this);

        return frame;
    },

    setEvent: function(event){
        this._event = event;
    },

    getEvent: function(){
        return this._event;
    }

});

ccs.EventFrame.create = function(){
    return new ccs.EventFrame();
};

ccs.ZOrderFrame = ccs.Frame.extend({

    _zorder: null,

    onEnter: function(nextFrame){
        if(this._node)
            this._node.setLocalZOrder(this._zorder);
    },

    clone: function(){
        var frame = new ccs.ZOrderFrame();
        frame.setZOrder(this._zorder);

        frame._cloneProperty(this);

        return frame;
    },

    setZOrder: function(zorder){
        this._zorder = zorder;
    },

    getZOrder: function(){
        return this._zorder;
    }

});

ccs.ZOrderFrame.create = function(){
    return new ccs.ZOrderFrame();
};