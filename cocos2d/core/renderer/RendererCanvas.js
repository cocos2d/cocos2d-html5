/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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

cc.rendererCanvas = {
    childrenOrderDirty: true,
    _transformNodePool: [],                              //save nodes transform dirty
    _renderCmds: [],                                    //save renderer commands

    rendering: function (ctx) {
        var locCmds = this._renderCmds, i,len;
        var context = ctx || cc._renderContext;
        for(i = 0, len = locCmds.length; i< len; i++){
            locCmds[i].rendering(context);
        }
    },

    resetFlag: function(){
        this.childrenOrderDirty = false;
        this._transformNodePool.length = 0;
    },

    transform: function () {
        var locPool = this._transformNodePool;
        //sort the pool
        locPool.sort(this._sortNodeByLevelAsc);

        //transform node
        for(var i = 0, len = locPool.length; i< len; i++){
            if(locPool[i]._transformDirty)
                locPool[i]._transformForRenderer();
        }
        locPool.length = 0;
    },

    transformDirty : function(){
        return this._transformNodePool.length > 0;
    },

    _sortNodeByLevelAsc: function (n1, n2) {
        return n1._curLevel - n2._curLevel;
    },

    pushDirtyNode: function (node) {
        if (this._transformNodePool.indexOf(node) === -1)
            this._transformNodePool.push(node);
    },

    clearRenderCommands: function(){
        this._renderCmds.length = 0;
    },

    pushRenderCommand: function(cmd){
        if (this._renderCmds.indexOf(cmd) === -1)
            this._renderCmds.push(cmd);
    }
};
cc.renderer = cc.rendererCanvas;

cc.TextureRenderCmdCanvas = function(node){
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._texture = null;
    this._isLighterMode = false;
    this._opacity = 1;
    this._flippedX = false;
    this._flippedY = false;
    this._textureCoord = {x: 0, y: 0, width:0, height:0,validRect: false};
    this._drawingRect = cc.rect(0, 0, 0, 0);
    this._color = cc.color(255,255,255,255);

    this._node = node;
};

cc.TextureRenderCmdCanvas.prototype.rendering = function (ctx) {
    var _t = this;
    var context = ctx || cc._renderContext, t = this._transform;
    context.save();
    //transform
    context.transform(t.a, t.c, t.b, t.d, t.tx, -t.ty);

    if (_t._isLighterMode)
        context.globalCompositeOperation = 'lighter';
    var locTextureCoord = _t._textureCoord, locDrawingRect = _t._drawingRect;

    if (_t._flippedX)
        context.scale(-1, 1);
    if (_t._flippedY)
        context.scale(1, -1);

    if (_t._texture && locTextureCoord.validRect) {
        if (_t._texture._isLoaded) {
            context.globalAlpha = _t._opacity;
            var image = _t._texture.getHtmlElementObj();
            context.drawImage(image,
                locTextureCoord.x, locTextureCoord.y, locTextureCoord.width, locTextureCoord.height,
                locDrawingRect.x, locDrawingRect.y, locDrawingRect.width , locDrawingRect.height);
        }
    } else if (locDrawingRect.width !== 0) {
        var curColor = _t._color;
        context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + "," + _t._opacity + ")";
        context.fillRect(locDrawingRect.x , locDrawingRect.y , locDrawingRect.width , locDrawingRect.height);
    }

    //restore the context for flipped
    if (_t._flippedX)
        context.scale(-1, 1);
    if (_t._flippedY)
        context.scale(1, -1);

    context.restore();
    cc.g_NumberOfDraws++;
};

cc.RectRenderCmdCanvas = function(node){
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._isLighterMode = false;
    this._drawingRect = cc.rect(0, 0, 0, 0);
    this._color = cc.color(255,255,255,255);

    this._node = node;
};

cc.RectRenderCmdCanvas.prototype.rendering = function(ctx){
    var context = ctx || cc._renderContext, t = this._transform, curColor = this._color, locRect = this._drawingRect;
    context.save();
    if (this._isLighterMode)
        context.globalCompositeOperation = 'lighter';
    //transform
    context.transform(t.a, t.c, t.b, t.d, t.tx, -t.ty);
    context.fillStyle = "rgba(" + (0 | curColor.r) + "," + (0 | curColor.g) + ","
        + (0 | curColor.b) + "," + curColor.a + ")";
    context.fillRect(locRect.x, locRect.y, locRect.width, -locRect.height);

    context.restore();
    cc.g_NumberOfDraws++;
};

cc.GradientRectRenderCmdCanvas = function(node){
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._isLighterMode = false;
    this._opacity = 1;
    this._drawingRect = cc.rect(0, 0, 0, 0);
    this._startColor = cc.color(255,255,255,255);
    this._endColor = cc.color(255,255,255,255);
    this._startPoint = cc.p(0,0);
    this._endPoint = cc.p(0,0);

    this._node = node;
};

cc.GradientRectRenderCmdCanvas.prototype.rendering = function(ctx){
    var context = ctx || cc._renderContext, _t = this, t = this._transform;
    context.save();
    if (_t._isLighterMode)
        context.globalCompositeOperation = 'lighter';
    //transform
    context.transform(t.a, t.c, t.b, t.d, t.tx, -t.ty);

    var opacity = _t._opacity, locRect = this._drawingRect;
    var gradient = context.createLinearGradient(_t._startPoint.x, _t._startPoint.y, _t._endPoint.x, _t._endPoint.y);
    var locStartColor = _t._startColor, locEndColor = _t._endColor;
    gradient.addColorStop(0, "rgba(" + Math.round(locStartColor.r) + "," + Math.round(locStartColor.g) + ","
        + Math.round(locStartColor.b) + "," + (opacity * (locStartColor.a / 255)).toFixed(4) + ")");
    gradient.addColorStop(1, "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
        + Math.round(locEndColor.b) + "," + (opacity * (locEndColor.a / 255)).toFixed(4) + ")");
    context.fillStyle = gradient;
    context.fillRect(locRect.x, locRect.y, locRect.width, -locRect.height);

    context.restore();
};
