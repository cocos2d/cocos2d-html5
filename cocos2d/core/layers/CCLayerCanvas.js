/****************************************************************************
 Copyright (c) 2010-2014 cocos2d-x.org

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
    //cc.LayerColor define start
    var _p = cc.LayerColor.prototype;
    _p.ctor = function (color, width, height) {
        cc.LayerRGBA.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        cc.LayerColor.prototype.init.call(this, color, width, height);
    }
    _p._setWidth = cc.LayerRGBA.prototype._setWidth;
    _p._setHeight = cc.LayerRGBA.prototype._setHeight;
    _p._updateColor = function () {};
    _p.draw = function (ctx) {
        var context = ctx || cc._renderContext, _t = this;
        var locEGLViewer = cc.view, locDisplayedColor = _t._displayedColor;

        context.fillStyle = "rgba(" + (0 | locDisplayedColor.r) + "," + (0 | locDisplayedColor.g) + ","
            + (0 | locDisplayedColor.b) + "," + _t._displayedOpacity / 255 + ")";
        context.fillRect(0, 0, _t.width * locEGLViewer.getScaleX(), -_t.height * locEGLViewer.getScaleY());
        cc.g_NumberOfDraws++;
    };
    //cc.LayerGradient define end

    //cc.LayerGradient define start
    _p = cc.LayerGradient.prototype;
    _p.draw = function (ctx) {
        var context = ctx || cc._renderContext, _t = this;
        if (_t._isLighterMode)
            context.globalCompositeOperation = 'lighter';

        context.save();
        var locEGLViewer = cc.view, opacityf = _t._displayedOpacity / 255.0;
        var tWidth = _t.width * locEGLViewer.getScaleX(), tHeight = _t.height * locEGLViewer.getScaleY();
        var tGradient = context.createLinearGradient(_t._gradientStartPoint.x, _t._gradientStartPoint.y,
            _t._gradientEndPoint.x, _t._gradientEndPoint.y);
        var locDisplayedColor = _t._displayedColor, locEndColor = _t._endColor;
        tGradient.addColorStop(0, "rgba(" + Math.round(locDisplayedColor.r) + "," + Math.round(locDisplayedColor.g) + ","
            + Math.round(locDisplayedColor.b) + "," + (opacityf * (_t._startOpacity / 255)).toFixed(4) + ")");
        tGradient.addColorStop(1, "rgba(" + Math.round(locEndColor.r) + "," + Math.round(locEndColor.g) + ","
            + Math.round(locEndColor.b) + "," + (opacityf * (_t._endOpacity / 255)).toFixed(4) + ")");
        context.fillStyle = tGradient;
        context.fillRect(0, 0, tWidth, -tHeight);

        if (_t._rotation != 0)
            context.rotate(_t._rotationRadians);
        context.restore();
    };
    _p._updateColor = function(){
        var _t = this;
        var locAlongVector = _t._alongVector, tWidth = _t.width * 0.5, tHeight = _t.height * 0.5;

        _t._gradientStartPoint.x = tWidth * (-locAlongVector.x) + tWidth;
        _t._gradientStartPoint.y = tHeight * locAlongVector.y - tHeight;
        _t._gradientEndPoint.x = tWidth * locAlongVector.x + tWidth;
        _t._gradientEndPoint.y = tHeight * (-locAlongVector.y) - tHeight;
    };
    //cc.LayerGradient define end
}