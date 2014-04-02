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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    /**
     * CCAtlasNode
     * @type {Object|Function|cc.AtlasNode|*}
     * @private
     */

    var _p = cc.AtlasNode.prototype;

    _p.initWithTexture = function(texture, tileWidth, tileHeight, itemsToRender){
        var _t = this;
        _t._itemWidth = tileWidth;
        _t._itemHeight = tileHeight;

        _t._opacityModifyRGB = true;
        _t._originalTexture = texture;
        if (!_t._originalTexture) {
            cc.log("cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.");
            return false;
        }
        _t._textureForCanvas = _t._originalTexture;
        _t._calculateMaxItems();

        _t.quadsToDraw = itemsToRender;
        return true;
    };

    _p.draw = cc.Node.prototype.draw;

    _p.setColor = function (color3) {
        var _t = this;
        var locRealColor = _t._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = cc.color(color3.r,color3.g,color3.b);
        _t._colorUnmodified = color3;

        if (_t._opacityModifyRGB) {
            var locDisplayedOpacity = _t._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.NodeRGBA.prototype.setColor.call(_t, color3);

        if (_t.texture) {
            var element = _t._originalTexture.getHtmlElementObj();
            if(!element)
                return;
            var cacheTextureForColor = cc.textureCache.getTextureColors(element);
            if (cacheTextureForColor) {
                var textureRect = cc.rect(0, 0, element.width, element.height);
                element = cc.generateTintImage(element, cacheTextureForColor, _t._realColor, textureRect);
                var locTexture = new cc.Texture2D();
                locTexture.initWithElement(element);
                locTexture.handleLoadedTexture();
                _t.texture = locTexture;
            }
        }
    };

    _p.setOpacity = function (opacity) {
        var _t = this;
        cc.NodeRGBA.prototype.setOpacity.call(_t, opacity);
        // special opacity for premultiplied textures
        if (_t._opacityModifyRGB) {
            _t.color = _t._colorUnmodified;
        }
    };

    _p.getTexture = function () {
        return  this._textureForCanvas;
    };

    _p.setTexture = function (texture) {
        this._textureForCanvas = texture;
    };

    _p._calculateMaxItems = function () {
        var _t = this;
        var selTexture = _t.texture;
        var size = selTexture.getContentSize();

        _t._itemsPerColumn = 0 | (size.height / _t._itemHeight);
        _t._itemsPerRow = 0 | (size.width / _t._itemWidth);
    };


    /**
     * CCNode
     * @type {Object|Function|cc.Node|*}
     * @private
     */


    _p = cc.Node.prototype;

    _p.ctor = function () {
        this._initNode();

        //Canvas
    };

    _p.setNodeDirty = function () {
        var _t = this;
        _t._setNodeDirtyForCache();
        _t._transformDirty === false && (_t._transformDirty = _t._inverseDirty = true);
    };

    _p.visit = function (ctx) {
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        //visit for canvas
        var context = ctx || cc._renderContext, i;
        var children = _t._children,child;
        context.save();
        _t.transform(context);
        var len = children.length;
        if (len > 0) {
            _t.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0)
                    child.visit(context);
                else
                    break;
            }
            _t.draw(context);
            for (; i < len; i++) {
                children[i].visit(context);
            }
        } else
            _t.draw(context);

        _t.arrivalOrder = 0;
        context.restore();
    };

    _p.transform = function (ctx) {
        // transform for canvas
        var context = ctx || cc._renderContext, eglViewer = cc.view;

        var t = this.nodeToParentTransform();
        context.transform(t.a, t.c, t.b, t.d, t.tx * eglViewer.getScaleX(), -t.ty * eglViewer.getScaleY());
    };

    _p.nodeToParentTransform = function () {
        var _t = this;
        if (_t._transformDirty) {
            var t = _t._transform;// quick reference

            // base position
            t.tx = _t._position.x;
            t.ty = _t._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (_t._rotationX) {
                Cos = Math.cos(_t._rotationRadiansX);
                Sin = Math.sin(_t._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = _t._scaleX, lScaleY = _t._scaleY;
            var appX = _t._anchorPointInPoints.x, appY = _t._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001)?  0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001)? 0.000001 : lScaleY;

            // skew
            if (_t._skewX || _t._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-_t._skewX * Math.PI / 180);
                var sky = Math.tan(-_t._skewY * Math.PI / 180);
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.b = Cos * skx + -Sin;
                t.c = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.c *= sx;
                t.b *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (_t._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (_t._additionalTransformDirty) {
                _t._transform = cc.AffineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }

            _t._transformDirty = false;
        }
        return _t._transform;
    };

    delete _p;

}