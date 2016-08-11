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

(function(){

    ccs.Armature.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._parentCmd = null;
        this._realAnchorPointInPoints = new cc.Point(0,0);
    };

    var proto = ccs.Armature.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cc.inject(ccs.Armature.RenderCmd, proto);
    proto.constructor = ccs.Armature.WebGLRenderCmd;

    proto.uploadData = function (f32buffer, ui32buffer, vertexDataOffset) {
        var node = this._node, cmd;
        var parentCmd = this._parentCmd || this;

        var locChildren = node._children;
        var alphaPremultiplied = cc.BlendFunc.ALPHA_PREMULTIPLIED, alphaNonPremultipled = cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
        for (var i = 0, len = locChildren.length; i < len; i++) {
            var selBone = locChildren[i];
            var boneCmd = selBone._renderCmd;
            if (selBone && selBone.getDisplayRenderNode) {
                var selNode = selBone.getDisplayRenderNode();
                if (null === selNode)
                    continue;
                cmd = selNode._renderCmd;
                switch (selBone.getDisplayRenderNodeType()) {
                    case ccs.DISPLAY_TYPE_SPRITE:
                        if (selNode instanceof ccs.Skin) {
                            selNode.setShaderProgram(this._shaderProgram);
                            this._updateColorAndOpacity(cmd, selBone);   //because skin didn't call visit()
                            cmd.transform(parentCmd);

                            var func = selBone.getBlendFunc();
                            if (func.src !== alphaPremultiplied.src || func.dst !== alphaPremultiplied.dst)
                                selNode.setBlendFunc(selBone.getBlendFunc());
                            else {
                                var tex = selNode.getTexture();
                                if (node._blendFunc.src === alphaPremultiplied.src && 
                                    node._blendFunc.dst === alphaPremultiplied.dst && 
                                    tex && !tex.hasPremultipliedAlpha()) {
                                    selNode.setBlendFunc(alphaNonPremultipled);
                                }
                                else {
                                    selNode.setBlendFunc(node._blendFunc);
                                }
                            }
                            // Support batch for Armature skin
                            cc.renderer._uploadBufferData(cmd);
                        }
                        break;
                    case ccs.DISPLAY_TYPE_ARMATURE:
                        selNode.setShaderProgram(this._shaderProgram);
                        cmd._parentCmd = this;
                        // Continue rendering in default
                    default:
                        boneCmd._syncStatus(parentCmd);
                        cmd._syncStatus(boneCmd);
                        if (cmd.uploadData) {
                            cc.renderer._uploadBufferData(cmd);
                        }
                        else if (cmd.rendering) {
                            // Finish previous batch
                            cc.renderer._batchRendering();
                            cmd.rendering(cc._renderContext);
                        }
                        break;
                }
            } else if (selBone instanceof cc.Node) {
                selBone.setShaderProgram(this._shaderProgram);
                boneCmd._syncStatus(parentCmd);
                if (boneCmd.uploadData) {
                    cc.renderer._uploadBufferData(boneCmd);
                }
                else if (boneCmd.rendering) {
                    // Finish previous batch
                    cc.renderer._batchRendering();
                    boneCmd.rendering(cc._renderContext);
                }
            }
        }
        this._parentCmd = null;
        return 0;
    };

    proto.initShaderCache = function(){
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR);
    };

    proto.setShaderProgram = function(shaderProgram){
        this._shaderProgram = shaderProgram;
    };

    proto._updateColorAndOpacity = function(skinRenderCmd, bone){
        //update displayNode's color and opacity
        var parentColor = bone._renderCmd._displayedColor, parentOpacity = bone._renderCmd._displayedOpacity;

        var flags = cc.Node._dirtyFlags, locFlag = skinRenderCmd._dirtyFlag;
        var colorDirty = locFlag & flags.colorDirty,
            opacityDirty = locFlag & flags.opacityDirty;
        if(colorDirty)
            skinRenderCmd._updateDisplayColor(parentColor);
        if(opacityDirty)
            skinRenderCmd._updateDisplayOpacity(parentOpacity);
        if(colorDirty || opacityDirty)
            skinRenderCmd._updateColor();
    };

    proto.visit = function(parentCmd){
        var node = this._node;
        // quick return if not visible. children won't be drawn.
        if (!node._visible)
            return;

        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;

        this._syncStatus(parentCmd);

        node.sortAllChildren();
        var renderer = cc.renderer,
            children = node._children, child,
            i, len = children.length;

        if (isNaN(node._customZ)) {
            node._vertexZ = renderer.assignedZ;
            renderer.assignedZ += renderer.assignedZStep;
        }

        for (i = 0; i < len; i++) {
            child = children[i];
            if (child._localZOrder < 0) {
                if (isNaN(child._customZ)) {
                    child._vertexZ = renderer.assignedZ;
                    renderer.assignedZ += renderer.assignedZStep;
                }
            }
            else {
                break;
            }
        }

        renderer.pushRenderCommand(this);
        for (; i < len; i++) {
            child = children[i];
            if (isNaN(child._customZ)) {
                child._vertexZ = renderer.assignedZ;
                renderer.assignedZ += renderer.assignedZStep;
            }
        }

        this._dirtyFlag = 0;
    };
})();