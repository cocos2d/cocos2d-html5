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

_tmp.PrototypeLayerRGBA = function () {
    var _p = cc.LayerRGBA.prototype;
    // Extended properties
    /** @expose */
    _p.opacityModifyRGB;
    cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB, _p.setOpacityModifyRGB);
    /** @expose */
    _p.opacity;
    cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
    /** @expose */
    _p.cascadeOpacity;
    cc.defineGetterSetter(_p, "cascadeOpacity", _p.isCascadeOpacityEnabled, _p.setCascadeOpacityEnabled);
    /** @expose */
    _p.color;
    cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
    /** @expose */
    _p.cascadeColor;
    cc.defineGetterSetter(_p, "cascadeColor", _p.isCascadeColorEnabled, _p.setCascadeColorEnabled);
};

_tmp.PrototypeLayerColor = function () {
    var _p = cc.LayerColor.prototype;
    // Override properties
    cc.defineGetterSetter(_p, "width", _p._getWidth, _p._setWidth);
    cc.defineGetterSetter(_p, "height", _p._getHeight, _p._setHeight);
};

_tmp.PrototypeLayerGradient = function () {
    var _p = cc.LayerGradient.prototype;
    // Extended properties
    /** @expose */
    _p.startColor;
    cc.defineGetterSetter(_p, "startColor", _p.getStartColor, _p.setStartColor);
    /** @expose */
    _p.endColor;
    cc.defineGetterSetter(_p, "endColor", _p.getEndColor, _p.setEndColor);
    /** @expose */
    _p.startOpacity;
    cc.defineGetterSetter(_p, "startOpacity", _p.getStartOpacity, _p.setStartOpacity);
    /** @expose */
    _p.endOpacity;
    cc.defineGetterSetter(_p, "endOpacity", _p.getEndOpacity, _p.setEndOpacity);
    /** @expose */
    _p.vector;
    cc.defineGetterSetter(_p, "vector", _p.getVector, _p.setVector);
};