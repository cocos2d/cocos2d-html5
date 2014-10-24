/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of _t software and associated documentation files (the "Software"), to deal
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

cc._tmp.WebGLSprite = function () {
    var _p = cc.Sprite.prototype;

    _p._spriteFrameLoadedCallback = function(spriteFrame){
        this.setNodeDirty(true);
        this.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());
        this.dispatchEvent("load");
    };

    _p.setOpacityModifyRGB = function (modify) {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.updateColor();
        }
    };

    _p.updateDisplayedOpacity = function (parentOpacity) {
        cc.Node.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this.updateColor();
    };

    _p.ctor = function (fileName, rect, rotated) {
        var self = this;
        cc.Node.prototype.ctor.call(self);
        self._shouldBeHidden = false;
        self._offsetPosition = cc.p(0, 0);
        self._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        self._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        self._rect = cc.rect(0,0,0,0);

        self._quad = new cc.V3F_C4B_T2F_Quad();
        self._quadWebBuffer = cc._renderContext.createBuffer();
        self._quadDirty = true;

        self._textureLoaded = true;

        self._softInit(fileName, rect, rotated);
    };

    _p._initRendererCmd = function(){
        this._rendererCmd = new cc.TextureRenderCmdWebGL(this);
    };

    _p.setBlendFunc = function (src, dst) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
    };

    _p.init = function () {
        var _t = this;
        if (arguments.length > 0)
            return _t.initWithFile(arguments[0], arguments[1]);

        cc.Node.prototype.init.call(_t);
        _t.dirty = _t._recursiveDirty = false;

        _t._blendFunc.src = cc.BLEND_SRC;
        _t._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        _t.texture = null;
        _t._textureLoaded = true;
        _t._flippedX = _t._flippedY = false;

        // default transform anchor: center
        _t.anchorX = 0.5;
        _t.anchorY = 0.5;

        // zwoptex default values
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;

        _t._hasChildren = false;

        // Atlas: Color
        var tempColor = {r: 255, g: 255, b: 255, a: 255};
        _t._quad.bl.colors = tempColor;
        _t._quad.br.colors = tempColor;
        _t._quad.tl.colors = tempColor;
        _t._quad.tr.colors = tempColor;
        _t._quadDirty = true;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        _t.setTextureRect(cc.rect(0, 0, 0, 0), false, cc.size(0, 0));
        return true;
    };

    _p.initWithTexture = function (texture, rect, rotated) {
        var _t = this;
        var argnum = arguments.length;

        cc.assert(argnum!=0, cc._LogInfos.Sprite_initWithTexture);

        rotated = rotated || false;

        if (!cc.Node.prototype.init.call(_t))
            return false;

        _t._batchNode = null;
        _t._recursiveDirty = false;
        _t.dirty = false;
        _t._opacityModifyRGB = true;

        _t._blendFunc.src = cc.BLEND_SRC;
        _t._blendFunc.dst = cc.BLEND_DST;

        _t._flippedX = _t._flippedY = false;

        // default transform anchor: center
        _t.anchorX = 0.5;
        _t.anchorY = 0.5;

        // zwoptex default values
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;
        _t._hasChildren = false;

        // Atlas: Color
        var tmpColor = cc.color(255, 255, 255, 255);
        var locQuad = _t._quad;
        locQuad.bl.colors = tmpColor;
        locQuad.br.colors = tmpColor;
        locQuad.tl.colors = tmpColor;
        locQuad.tr.colors = tmpColor;

        var locTextureLoaded = texture.isLoaded();
        _t._textureLoaded = locTextureLoaded;

        if (!locTextureLoaded) {
            _t._rectRotated = rotated || false;
            if (rect) {
                var locRect = _t._rect;
                locRect.x = rect.x;
                locRect.y = rect.y;
                locRect.width = rect.width;
                locRect.height = rect.height;
            }
            texture.addEventListener("load", _t._textureLoadedCallback, _t);
            return true;
        }

        if (!rect) {
            rect = cc.rect(0, 0, texture.width, texture.height);
        }

        if(texture && texture.url) {
            var _x, _y;
            if(rotated){
                _x = rect.x + rect.height;
                _y = rect.y + rect.width;
            }else{
                _x = rect.x + rect.width;
                _y = rect.y + rect.height;
            }
            if(_x > texture.width){
                cc.error(cc._LogInfos.RectWidth, texture.url);
            }
            if(_y > texture.height){
                cc.error(cc._LogInfos.RectHeight, texture.url);
            }
        }

        _t.texture = texture;
        _t.setTextureRect(rect, rotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        _t.batchNode = null;
        _t._quadDirty = true;
        return true;
    };

    _p._textureLoadedCallback = function (sender) {
        var _t = this;
        if(_t._textureLoaded)
            return;

        _t._textureLoaded = true;
        var locRect = _t._rect;
        if (!locRect) {
            locRect = cc.rect(0, 0, sender.width, sender.height);
        } else if (cc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }

        _t.texture = sender;
        _t.setTextureRect(locRect, _t._rectRotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        _t.batchNode = _t._batchNode;
        _t._quadDirty = true;
        _t.dispatchEvent("load");
    };

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        var _t = this;
        _t._rectRotated = rotated || false;
        _t.setContentSize(untrimmedSize || rect);

        _t.setVertexRect(rect);
        _t._setTextureCoords(rect);

        var relativeOffset = _t._unflippedOffsetPositionFromCenter;
        if (_t._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (_t._flippedY)
            relativeOffset.y = -relativeOffset.y;

        var locRect = _t._rect;
        _t._offsetPosition.x = relativeOffset.x + (_t._contentSize.width - locRect.width) / 2;
        _t._offsetPosition.y = relativeOffset.y + (_t._contentSize.height - locRect.height) / 2;

        // rendering using batch node
        if (_t._batchNode) {
            // update dirty, don't update _recursiveDirty
            _t.dirty = true;
        } else {
            // self rendering
            // Atlas: Vertex
            var x1 = _t._offsetPosition.x;
            var y1 = _t._offsetPosition.y;
            var x2 = x1 + locRect.width;
            var y2 = y1 + locRect.height;

            // Don't update Z.
            var locQuad = _t._quad;
            locQuad.bl.vertices = {x:x1, y:y1, z:0};
            locQuad.br.vertices = {x:x2, y:y1, z:0};
            locQuad.tl.vertices = {x:x1, y:y2, z:0};
            locQuad.tr.vertices = {x:x2, y:y2, z:0};

            _t._quadDirty = true;
        }
    };

    _p.updateTransform = function () {
        var _t = this;
        //cc.assert(_t._batchNode, "updateTransform is only valid when cc.Sprite is being rendered using an cc.SpriteBatchNode");

        // recaculate matrix only if it is dirty
        if (_t.dirty) {
            var locQuad = _t._quad, locParent = _t._parent;
            // If it is not visible, or one of its ancestors is not visible, then do nothing:
            if (!_t._visible || ( locParent && locParent != _t._batchNode && locParent._shouldBeHidden)) {
                locQuad.br.vertices = locQuad.tl.vertices = locQuad.tr.vertices = locQuad.bl.vertices = {x: 0, y: 0, z: 0};
                _t._shouldBeHidden = true;
            } else {
                _t._shouldBeHidden = false;

                if (!locParent || locParent == _t._batchNode) {
                    _t._transformToBatch = _t.nodeToParentTransform();
                } else {
                    //cc.assert(_t._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    _t._transformToBatch = cc.affineTransformConcat(_t.nodeToParentTransform(), locParent._transformToBatch);
                }

                //
                // calculate the Quad based on the Affine Matrix
                //
                var locTransformToBatch = _t._transformToBatch;
                var rect = _t._rect;
                var x1 = _t._offsetPosition.x;
                var y1 = _t._offsetPosition.y;

                var x2 = x1 + rect.width;
                var y2 = y1 + rect.height;
                var x = locTransformToBatch.tx;
                var y = locTransformToBatch.ty;

                var cr = locTransformToBatch.a;
                var sr = locTransformToBatch.b;
                var cr2 = locTransformToBatch.d;
                var sr2 = -locTransformToBatch.c;
                var ax = x1 * cr - y1 * sr2 + x;
                var ay = x1 * sr + y1 * cr2 + y;

                var bx = x2 * cr - y1 * sr2 + x;
                var by = x2 * sr + y1 * cr2 + y;

                var cx = x2 * cr - y2 * sr2 + x;
                var cy = x2 * sr + y2 * cr2 + y;

                var dx = x1 * cr - y2 * sr2 + x;
                var dy = x1 * sr + y2 * cr2 + y;

                var locVertexZ = _t._vertexZ;
                if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                    ax = 0 | ax;
                    ay = 0 | ay;
                    bx = 0 | bx;
                    by = 0 | by;
                    cx = 0 | cx;
                    cy = 0 | cy;
                    dx = 0 | dx;
                    dy = 0 | dy;
                }
                locQuad.bl.vertices = {x: ax, y: ay, z: locVertexZ};
                locQuad.br.vertices = {x: bx, y: by, z: locVertexZ};
                locQuad.tl.vertices = {x: dx, y: dy, z: locVertexZ};
                locQuad.tr.vertices = {x: cx, y: cy, z: locVertexZ};
            }
            _t.textureAtlas.updateQuad(locQuad, _t.atlasIndex);
            _t._recursiveDirty = false;
            _t.dirty = false;
        }

        // recursively iterate over children
        if (_t._hasChildren)
            _t._arrayMakeObjectsPerformSelector(_t._children, cc.Node._StateCallbackType.updateTransform);

        if (cc.SPRITE_DEBUG_DRAW) {
            // draw bounding box
            var vertices = [
                cc.p(_t._quad.bl.vertices.x, _t._quad.bl.vertices.y),
                cc.p(_t._quad.br.vertices.x, _t._quad.br.vertices.y),
                cc.p(_t._quad.tr.vertices.x, _t._quad.tr.vertices.y),
                cc.p(_t._quad.tl.vertices.x, _t._quad.tl.vertices.y)
            ];
            cc._drawingUtil.drawPoly(vertices, 4, true);
        }
    };

    _p.addChild = function (child, localZOrder, tag) {
        var _t = this;

        cc.assert(child, cc._LogInfos.Sprite_addChild_3);

        if (localZOrder == null)
            localZOrder = child._localZOrder;
        if (tag == null)
            tag = child.tag;

        if (_t._batchNode) {
            if(!(child instanceof cc.Sprite)){
                cc.log(cc._LogInfos.Sprite_addChild);
                return;
            }
            if(child.texture._webTextureObj !== _t.textureAtlas.texture._webTextureObj)
                cc.log(cc._LogInfos.Sprite_addChild_2);

            //put it in descendants array of batch node
            _t._batchNode.appendChild(child);
            if (!_t._reorderChildDirty)
                _t._setReorderChildDirtyRecursively();
        }

        //cc.Node already sets isReorderChildDirty_ so _t needs to be after batchNode check
        cc.Node.prototype.addChild.call(_t, child, localZOrder, tag);
        _t._hasChildren = true;
    };

    _p.setOpacity = function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        this.updateColor();
    };

    _p.setColor = function (color3) {
        cc.Node.prototype.setColor.call(this, color3);
        this.updateColor();
    };

    _p.updateDisplayedColor = function (parentColor) {
        cc.Node.prototype.updateDisplayedColor.call(this, parentColor);
        this.updateColor();
    };

    _p.setSpriteFrame = function (newFrame) {
        var _t = this;
        if(cc.isString(newFrame)){
            newFrame = cc.spriteFrameCache.getSpriteFrame(newFrame);
            cc.assert(newFrame, cc._LogInfos.Sprite_setSpriteFrame);
        }

        _t.setNodeDirty(true);
        var frameOffset = newFrame.getOffset();
        _t._unflippedOffsetPositionFromCenter.x = frameOffset.x;
        _t._unflippedOffsetPositionFromCenter.y = frameOffset.y;

        var pNewTexture = newFrame.getTexture();
        var locTextureLoaded = newFrame.textureLoaded();
        if (!locTextureLoaded) {
            _t._textureLoaded = false;
            newFrame.addEventListener("load", function (sender) {
                _t._textureLoaded = true;
                var locNewTexture = sender.getTexture();
                if (locNewTexture != _t._texture)
                    _t.texture = locNewTexture;
                _t.setTextureRect(sender.getRect(), sender.isRotated(), sender.getOriginalSize());

                _t.dispatchEvent("load");
            }, _t);
        }
        // update texture before updating texture rect
        if (pNewTexture != _t._texture)
            _t.texture = pNewTexture;

        // update rect
        _t._rectRotated = newFrame.isRotated();
        _t.setTextureRect(newFrame.getRect(), _t._rectRotated, newFrame.getOriginalSize());
    };

    _p.isFrameDisplayed = function (frame) {
        return (cc.rectEqualToRect(frame.getRect(), this._rect) && frame.getTexture().getName() == this._texture.getName()
            && cc.pointEqualToPoint(frame.getOffset(), this._unflippedOffsetPositionFromCenter));
    };

    _p.setBatchNode = function (spriteBatchNode) {
        var _t = this;
        _t._batchNode = spriteBatchNode; // weak reference

        // self render
        if (!_t._batchNode) {
            _t.atlasIndex = cc.Sprite.INDEX_NOT_INITIALIZED;
            _t.textureAtlas = null;
            _t._recursiveDirty = false;
            _t.dirty = false;

            var x1 = _t._offsetPosition.x;
            var y1 = _t._offsetPosition.y;
            var x2 = x1 + _t._rect.width;
            var y2 = y1 + _t._rect.height;
            var locQuad = _t._quad;
            locQuad.bl.vertices = {x:x1, y:y1, z:0};
            locQuad.br.vertices = {x:x2, y:y1, z:0};
            locQuad.tl.vertices = {x:x1, y:y2, z:0};
            locQuad.tr.vertices = {x:x2, y:y2, z:0};

            _t._quadDirty = true;
        } else {
            // using batch
            _t._transformToBatch = cc.affineTransformIdentity();
            _t.textureAtlas = _t._batchNode.textureAtlas; // weak ref
        }
    };

    _p.setTexture = function (texture) {
        var _t = this;
        if(texture && (cc.isString(texture))){
            texture = cc.textureCache.addImage(texture);
            _t.setTexture(texture);

            //TODO
            var size = texture.getContentSize();
            _t.setTextureRect(cc.rect(0,0, size.width, size.height));
            //If image isn't loaded. Listen for the load event.
            if(!texture._isLoaded){
                texture.addEventListener("load", function(){
                    var size = texture.getContentSize();
                    _t.setTextureRect(cc.rect(0,0, size.width, size.height));
                }, this);
            }
            return;
        }
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet

        cc.assert(!texture || (texture instanceof cc.Texture2D), cc._LogInfos.Sprite_setTexture_2);

        // If batchnode, then texture id should be the same
        if(_t._batchNode && _t._batchNode.texture != texture) {
            cc.log(cc._LogInfos.Sprite_setTexture);
            return;
        }

        if (texture)
            _t.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        else
            _t.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR);

        if (!_t._batchNode && _t._texture != texture) {
            _t._texture = texture;
            _t._updateBlendFunc();
        }
    };

    _p.draw = function () {
        var _t = this;
        if (!_t._textureLoaded)
            return;

        var gl = cc._renderContext, locTexture = _t._texture;
        //cc.assert(!_t._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

        if (locTexture) {
            if (locTexture._isLoaded) {
                _t._shaderProgram.use();
                _t._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

                cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
                //optimize performance for javascript
                cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
                cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

                gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
                if (_t._quadDirty) {
                    gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.DYNAMIC_DRAW);
                    _t._quadDirty = false;
                }
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
                gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        } else {
            _t._shaderProgram.use();
            _t._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

            cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
            cc.glBindTexture2D(null);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

            gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
            if (_t._quadDirty) {
                cc._renderContext.bufferData(cc._renderContext.ARRAY_BUFFER, _t._quad.arrayBuffer, cc._renderContext.STATIC_DRAW);
                _t._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        cc.g_NumberOfDraws++;
        if (cc.SPRITE_DEBUG_DRAW === 0 && !_t._showNode)
            return;

        if (cc.SPRITE_DEBUG_DRAW === 1 || _t._showNode) {
            // draw bounding box
            var locQuad = _t._quad;
            var verticesG1 = [
                cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
                cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
                cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
                cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
            ];
            cc._drawingUtil.drawPoly(verticesG1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            var drawRectG2 = _t.getTextureRect();
            var offsetPixG2 = _t.getOffsetPosition();
            var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y),
                cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y + drawRectG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawRectG2.height)];
            cc._drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
    };

    delete _p;
}