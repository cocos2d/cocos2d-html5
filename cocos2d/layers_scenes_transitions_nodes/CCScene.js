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


/**
 * <p>cc.Scene is a subclass of cc.Node that is used only as an abstract concept.</p>
 *  <p>cc.Scene an cc.Node are almost identical with the difference that cc.Scene has it's
 * anchor point (by default) at the center of the screen.</p>
 *
 * <p>For the moment cc.Scene has no other logic than that, but in future releases it might have
 * additional logic.</p>
 *
 * <p>It is a good practice to use and cc.Scene as the parent of all your nodes.</p>
 * @class
 * @extends cc.Node
 */
cc.Scene = cc.Node.extend(/** @lends cc.Scene# */{
    /**
     * Constructor
     */
    ctor:function () {
        this._super();
        this._ignoreAnchorPointForPosition = true;
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.setContentSize(cc.Director.getInstance().getWinSize());
    }
});

/**
 * creates a scene
 * @return {cc.Scene}
 * @example
 * // Example
 * var aScene = cc.Scene.create();
 * //OR
 * var aScene = new cc.Scene();
 */
cc.Scene.create = function () {
    var scene = new cc.Scene();
    scene.init();
    return scene;
};
