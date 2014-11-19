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

cc._tmp.PrototypeCCNode = function () {

    var _p = cc.Node.prototype;

    cc.addProperty(_p, "x", _p.getPositionX, _p.setPositionX);
    cc.addProperty(_p, "y", _p.getPositionY, _p.setPositionY);
    /** @expose */
    //_p.pos;
    //cc.addProperty(_p, "pos", _p.getPosition, _p.setPosition);
    /** @expose */
    _p.width;
    cc.addProperty(_p, "width", _p._getWidth, _p._setWidth);
    /** @expose */
    _p.height;
    cc.addProperty(_p, "height", _p._getHeight, _p._setHeight);
    /** @expose */
    //_p.size;
    //cc.addProperty(_p, "size", _p.getContentSize, _p.setContentSize);
    /** @expose */
    //_p.anchor;
    //cc.addProperty(_p, "anchor", _p._getAnchor, _p._setAnchor);
    /** @expose */
    _p.anchorX;
    cc.addProperty(_p, "anchorX", _p._getAnchorX, _p._setAnchorX);
    /** @expose */
    _p.anchorY;
    cc.addProperty(_p, "anchorY", _p._getAnchorY, _p._setAnchorY);
    /** @expose */
    _p.skewX;
    cc.addProperty(_p, "skewX", _p.getSkewX, _p.setSkewX);
    /** @expose */
    _p.skewY;
    cc.addProperty(_p, "skewY", _p.getSkewY, _p.setSkewY);
    /** @expose */
    _p.zIndex;
    cc.addProperty(_p, "zIndex", _p.getLocalZOrder, _p.setLocalZOrder);
    /** @expose */
    _p.vertexZ;
    cc.addProperty(_p, "vertexZ", _p.getVertexZ, _p.setVertexZ);
    /** @expose */
    _p.rotation;
    cc.addProperty(_p, "rotation", _p.getRotation, _p.setRotation);
    /** @expose */
    _p.rotationX;
    cc.addProperty(_p, "rotationX", _p.getRotationX, _p.setRotationX);
    /** @expose */
    _p.rotationY;
    cc.addProperty(_p, "rotationY", _p.getRotationY, _p.setRotationY);
    /** @expose */
    _p.scale;
    cc.addProperty(_p, "scale", _p.getScale, _p.setScale);
    /** @expose */
    _p.scaleX;
    cc.addProperty(_p, "scaleX", _p.getScaleX, _p.setScaleX);
    /** @expose */
    _p.scaleY;
    cc.addProperty(_p, "scaleY", _p.getScaleY, _p.setScaleY);
    /** @expose */
    _p.children;
    cc.addProperty(_p, "children", _p.getChildren);
    /** @expose */
    _p.childrenCount;
    cc.addProperty(_p, "childrenCount", _p.getChildrenCount);
    /** @expose */
    _p.parent;
    cc.addProperty(_p, "parent", _p.getParent, _p.setParent);
    /** @expose */
    _p.visible;
    cc.addProperty(_p, "visible", _p.isVisible, _p.setVisible);
    /** @expose */
    _p.running;
    cc.addProperty(_p, "running", _p.isRunning);
    /** @expose */
    _p.ignoreAnchor;
    cc.addProperty(_p, "ignoreAnchor", _p.isIgnoreAnchorPointForPosition, _p.ignoreAnchorPointForPosition);
    /** @expose */
    _p.tag;
    /** @expose */
    _p.userData;
    /** @expose */
    _p.userObject;
    /** @expose */
    _p.arrivalOrder;
    /** @expose */
    _p.actionManager;
    cc.addProperty(_p, "actionManager", _p.getActionManager, _p.setActionManager);
    /** @expose */
    _p.scheduler;
    cc.addProperty(_p, "scheduler", _p.getScheduler, _p.setScheduler);
    //cc.addProperty(_p, "boundingBox", _p.getBoundingBox);
    /** @expose */
    _p.shaderProgram;
    cc.addProperty(_p, "shaderProgram", _p.getShaderProgram, _p.setShaderProgram);

    /** @expose */
    _p.opacity;
    cc.addProperty(_p, "opacity", _p.getOpacity, _p.setOpacity);
    /** @expose */
    _p.opacityModifyRGB;
    cc.addProperty(_p, "opacityModifyRGB", _p.isOpacityModifyRGB);
    /** @expose */
    _p.cascadeOpacity;
    cc.addProperty(_p, "cascadeOpacity", _p.isCascadeOpacityEnabled, _p.setCascadeOpacityEnabled);
    /** @expose */
    _p.color;
    cc.addProperty(_p, "color", _p.getColor, _p.setColor);
    /** @expose */
    _p.cascadeColor;
    cc.addProperty(_p, "cascadeColor", _p.isCascadeColorEnabled, _p.setCascadeColorEnabled);
};