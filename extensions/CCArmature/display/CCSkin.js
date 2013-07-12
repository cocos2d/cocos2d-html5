/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

cc.Skin = cc.Sprite.extend({
    _skinData:null,
    _bone:null,
    _skinTransform:cc.AffineTransformIdentity(),
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);
        this._skinData = null;
        this._bone = null;
        this._skinTransform = cc.AffineTransformIdentity();
    },

    setSkinData:function (skinData) {
        this._skinData = skinData;

        this.setScaleX(this._skinData.scaleX);
        this.setScaleY(this._skinData.scaleY);
        this.setRotation(cc.RADIANS_TO_DEGREES(this._skinData.skewX));
        this.setPosition(cc.p(this._skinData.x, this._skinData.y));

        this._skinTransform = this.nodeToParentTransform();
        if (cc.renderContextType === cc.CANVAS) {
            this._skinTransform.b *= -1;
            this._skinTransform.c *= -1;
        }
    },

    getSkinData:function () {
        return this._skinData;
    },

    setBone:function (bone) {
        this._bone = bone;
    },

    getBone:function () {
        return this._bone;
    },

    updateSelfTransform:function () {
        this._transform = cc.AffineTransformConcat(this._skinTransform, this._bone.nodeToArmatureTransform());
        if (cc.renderContextType === cc.CANVAS) {
            this._transform.b *= -1;
            this._transform.c *= -1;
        }
    },
    /** returns a "local" axis aligned bounding box of the node. <br/>
     * The returned box is relative only to its parent.
     * @return {cc.Rect}
     */
    getBoundingBox:function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var transForm = this.nodeToParentTransform();
        if (cc.renderContextType === cc.CANVAS) {
            transForm = {a:transForm.a, b:-transForm.b, c:-transForm.c, d:transForm.d, tx:transForm.tx, ty:transForm.ty};
        }
        return cc.RectApplyAffineTransform(rect, transForm);
    },

    updateQuad:function () {
        return;
        // If it is not visible, or one of its ancestors is not visible, then do nothing:
        if (!this._visible) {
            this._quad.br.vertices = {x:0, y:0, z:0};
            this._quad.tl.vertices = {x:0, y:0, z:0};
            this._quad.tr.vertices = {x:0, y:0, z:0};
            this._quad.bl.vertices = {x:0, y:0, z:0};
        } else {
            // calculate the Quad based on the Affine Matrix
            var size = this._rect.size;

            var x1 = this._offsetPosition.x;
            var y1 = this._offsetPosition.y;

            var x2 = x1 + size.width;
            var y2 = y1 + size.height;

            var x = this._transform.tx;
            var y = this._transform.ty;

            var cr = this._transform.a;
            var sr = this._transform.b;
            var cr2 = this._transform.d;
            var sr2 = -this._transform.c;
            var ax = x1 * cr - y1 * sr2 + x;
            var ay = x1 * sr + y1 * cr2 + y;

            var bx = x2 * cr - y1 * sr2 + x;
            var by = x2 * sr + y1 * cr2 + y;

            var cx = x2 * cr - y2 * sr2 + x;
            var cy = x2 * sr + y2 * cr2 + y;

            var dx = x1 * cr - y2 * sr2 + x;
            var dy = x1 * sr + y2 * cr2 + y;

            this._quad.bl.vertices = {x:cc.RENDER_IN_SUBPIXEL(ax), y:cc.RENDER_IN_SUBPIXEL(ay), z:this._vertexZ};
            this._quad.br.vertices = {x:cc.RENDER_IN_SUBPIXEL(bx), y:cc.RENDER_IN_SUBPIXEL(by), z:this._vertexZ};
            this._quad.tl.vertices = {x:cc.RENDER_IN_SUBPIXEL(dx), y:cc.RENDER_IN_SUBPIXEL(dy), z:this._vertexZ};
            this._quad.tr.vertices = {x:cc.RENDER_IN_SUBPIXEL(cx), y:cc.RENDER_IN_SUBPIXEL(cy), z:this._vertexZ};

        }

        // MARMALADE CHANGE: ADDED CHECK FOR NULL, TO PERMIT SPRITES WITH NO BATCH NODE / TEXTURE ATLAS
        if (this._textureAtlas) {
            this._textureAtlas.updateQuad(this._quad, this._textureAtlas.getTotalQuads());
        }
    }
});

cc.Skin.create = function () {
    var skin = new cc.Skin();
    if (skin && skin.init()) {
        return skin;
    }
    return null;
};

cc.Skin.createWithSpriteFrameName = function (pszSpriteFrameName) {
    var skin = new cc.Skin();
    skin.testSpriteFrameName = pszSpriteFrameName;
    if (skin && skin.initWithSpriteFrameName(pszSpriteFrameName)) {
        return skin;
    }
    return null;
};