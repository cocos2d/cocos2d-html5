/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
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

(function(){
    ccs.Skin.WebGLRenderCmd = function(renderable){
        cc.Sprite.WebGLRenderCmd.call(this, renderable);
    };

    var proto = ccs.Skin.WebGLRenderCmd.prototype = Object.create(cc.Sprite.WebGLRenderCmd.prototype);
    cc.inject(ccs.Skin.RenderCmd, proto);
    proto.constructor = ccs.Skin.WebGLRenderCmd;

    // The following static properties must be provided for a auto batchable command
    proto.vertexBytesPerUnit = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
    proto.bytesPerUnit = proto.vertexBytesPerUnit;
    proto.indicesPerUnit = 6;
    proto.verticesPerUnit = 4;
    proto._supportBatch = true;

    proto.batchShader = null;

    proto.updateTransform = function(){
        var node = this._node;
        var locQuad = this._quad;
        var vertices = this._vertices;
        
        if (this._buffer) {
            //
            // calculate the Quad based on the Affine Matrix
            //
            var transform = this.getNodeToParentTransform();         //this._transform;

            var buffer = this._float32View,
                i, x, y, offset = 0,
                row = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT / 16,
                parentCmd = this.getParentRenderCmd(),
                parentMatrix = (parentCmd ? parentCmd._stackMatrix : cc.current_stack.top),
                t4x4 = this._transform4x4, stackMatrix = this._stackMatrix,
                mat = t4x4.mat;

            mat[0] = transform.a;
            mat[4] = transform.c;
            mat[12] = transform.tx;
            mat[1] = transform.b;
            mat[5] = transform.d;
            mat[13] = transform.ty;
            cc.kmMat4Multiply(stackMatrix, parentMatrix, t4x4);
            mat[14] = node._vertexZ;

            mat = stackMatrix.mat;

            for (i = 0; i < 4; ++i) {
                x = vertices[i].x;
                y = vertices[i].y;
                z = vertices[i].z;
                buffer[offset] = x * mat[0] + y * mat[4] + mat[12];
                buffer[offset+1] = x * mat[1] + y * mat[5] + mat[13];
                buffer[offset+2] = mat[14];
                offset += row;
            }
            // MARMALADE CHANGE: ADDED CHECK FOR nullptr, TO PERMIT SPRITES WITH NO BATCH NODE / TEXTURE ATLAS
            if (node.textureAtlas) {
                node.textureAtlas.updateQuad(locQuad, node.textureAtlas.getTotalQuads());
            }
            
            // Need manually buffer data because it's invoked during rendering
            cc._renderContext.bindBuffer(gl.ARRAY_BUFFER, this._buffer.vertexBuffer);
            cc._renderContext.bufferSubData(gl.ARRAY_BUFFER, this._bufferOffset, this._float32View);
            cc._renderContext.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    };
})();