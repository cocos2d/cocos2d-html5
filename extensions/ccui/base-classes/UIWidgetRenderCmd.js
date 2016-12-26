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

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        ccui.Widget.CanvasRenderCmd = function (renderable) {
            this._pNodeCmdCtor(renderable);
            this._needDraw = false;
        };

        var proto = ccui.Widget.CanvasRenderCmd.prototype = Object.create(cc.ProtectedNode.CanvasRenderCmd.prototype);
        proto.constructor = ccui.Widget.CanvasRenderCmd;

        proto.visit = function (parentCmd) {
            var node = this._node, renderer = cc.renderer;

            parentCmd = parentCmd || this.getParentRenderCmd();
            if (parentCmd)
                this._curLevel = parentCmd._curLevel + 1;

            if (isNaN(node._customZ)) {
                node._vertexZ = renderer.assignedZ;
                renderer.assignedZ += renderer.assignedZStep;
            }

            node._adaptRenderers();
            this._syncStatus(parentCmd);
        };

        proto.transform = function (parentCmd, recursive) {
            if (!this._transform) {
                this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
                this._worldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
            }

            var node = this._node;
            if (node._visible && node._running) {
                node._adaptRenderers();
                if(!this._usingLayoutComponent){
                    var widgetParent = node.getWidgetParent();
                    if (widgetParent) {
                        var parentSize = widgetParent.getContentSize();
                        if (parentSize.width !== 0 && parentSize.height !== 0) {
                            node._position.x = parentSize.width * node._positionPercent.x;
                            node._position.y = parentSize.height * node._positionPercent.y;
                        }
                    }
                }
                this.pNodeTransform(parentCmd, recursive);
            }
        };

        proto.widgetTransform = proto.transform;
    } else {
        ccui.Widget.WebGLRenderCmd = function (renderable) {
            this._pNodeCmdCtor(renderable);
            this._needDraw = false;
        };

        var proto = ccui.Widget.WebGLRenderCmd.prototype = Object.create(cc.ProtectedNode.WebGLRenderCmd.prototype);
        proto.constructor = ccui.Widget.WebGLRenderCmd;

        proto.visit = function (parentCmd) {
            var node = this._node, renderer = cc.renderer;

            parentCmd = parentCmd || this.getParentRenderCmd();
            if (parentCmd)
                this._curLevel = parentCmd._curLevel + 1;

            if (isNaN(node._customZ)) {
                node._vertexZ = renderer.assignedZ;
                renderer.assignedZ += renderer.assignedZStep;
            }

            node._adaptRenderers();
            this._syncStatus(parentCmd);
        };

        proto.transform = function (parentCmd, recursive) {
            if (!this._transform) {
                this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
                this._worldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
            }

            var node = this._node;
            if (node._visible && node._running) {
                node._adaptRenderers();

                if(!this._usingLayoutComponent) {
                    var widgetParent = node.getWidgetParent();
                    if (widgetParent) {
                        var parentSize = widgetParent.getContentSize();
                        if (parentSize.width !== 0 && parentSize.height !== 0) {
                            node._position.x = parentSize.width * node._positionPercent.x;
                            node._position.y = parentSize.height * node._positionPercent.y;
                        }
                    }
                }
                this.pNodeTransform(parentCmd, recursive);
            }
        };

        proto.widgetTransform = proto.transform;
    }
});
