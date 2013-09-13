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

cc.DisplayManager = cc.Class.extend({
    _decoDisplayList:null,
    _currentDecoDisplay:null,
    _displayRenderNode:null,
    _displayIndex:-1,
    _forceChangeDisplay:false,
    _bone:null,
    _visible:true,
    ctor:function () {
        this._decoDisplayList = [];
        this._currentDecoDisplay = null;
        this._displayRenderNode = null;
        this._displayIndex = -1;
        this._forceChangeDisplay = false;
        this._bone = null;
        this._visible = true;
    },

    init:function (bone) {
        this._bone = bone;
        this.initDisplayList(bone.getBoneData());
        return true;
    },

    addDisplay: function (displayData, index) {
        var decoDisplay = null;
        if (index >= 0 && index < this._decoDisplayList.length) {
            decoDisplay = this._decoDisplayList[index];
        }
        else {
            decoDisplay = cc.DecotativeDisplay.create();
            this._decoDisplayList.push(decoDisplay);
        }

        if(displayData instanceof cc.DisplayData){
            cc.DisplayFactory.addDisplay(this._bone, decoDisplay, displayData);
        }else{
            this._addDisplayOther(decoDisplay,displayData);
        }

        //! if changed display index is current display index, then change current display to the new display
        if (index == this._displayIndex) {
            this._displayIndex = -1;
            this.changeDisplayByIndex(index, false);
        }
    },

    _addDisplayOther:function(decoDisplay,display){
        var displayData = null;
        if (display instanceof cc.Skin){
            var skin = display;
            skin.setBone(this._bone);
            displayData = new cc.SpriteDisplayData();
            cc.DisplayFactory.initSpriteDisplay(this._bone, decoDisplay, skin.getDisplayName(), skin);
            var spriteDisplayData = decoDisplay.getDisplayData();
            if (spriteDisplayData instanceof cc.SpriteDisplayData)
                skin.setSkinData(spriteDisplayData.skinData);
            else
                skin.setSkinData(new cc.BaseData());
        }
        else if (display instanceof cc.ParticleSystem){
            displayData = new cc.ParticleDisplayData();
        }
        else if (display instanceof cc.Armature){
            displayData = new cc.ArmatureDisplayData();
            display.setParentBone(this._bone);
        }
        else  {
            displayData = new cc.DisplayData();
        }
        decoDisplay.setDisplay(display);
        decoDisplay.setDisplayData(displayData);
    },

    removeDisplay:function (index) {
        //cc.ArrayRemoveObjectAtIndex(this._decoDisplayList, index);
        this._decoDisplayList[index] = null;
        if (index == this._displayIndex) {
            this.setCurrentDecorativeDisplay(null);
        }
    },

    getDecorativeDisplayList:function(){
        return this._decoDisplayList;
    },

    changeDisplayByIndex:function (index, force) {
        if (index >= this._decoDisplayList.length) {
            cc.log("the index value is out of range");
            return;
        }

        this._forceChangeDisplay = force;

        //this._displayIndex == -1, it means you want to hide you display
        if (index < 0) {
            this._displayIndex = index;
            if (this._displayRenderNode) {
                this._displayRenderNode.removeFromParent(true);
                this.setCurrentDecorativeDisplay(null);
                this._displayRenderNode = null;
            }
            return;
        }

        //if index is equal to current display index,then do nothing
        if (this._displayIndex == index) {
            return;
        }

        this._displayIndex = index;

        var decoDisplay = this._decoDisplayList[this._displayIndex];

        if(!decoDisplay){
            return;
        }

        this.setCurrentDecorativeDisplay(decoDisplay);
    },

    setCurrentDecorativeDisplay:function (decoDisplay) {
        var locCurrentDecoDisplay = this._currentDecoDisplay;
        if (cc.ENABLE_PHYSICS_CHIPMUNK_DETECT) {
            if (locCurrentDecoDisplay && locCurrentDecoDisplay.getColliderDetector()) {
                locCurrentDecoDisplay.getColliderDetector().setActive(false);
            }
        }

        this._currentDecoDisplay = decoDisplay;
        locCurrentDecoDisplay = this._currentDecoDisplay;
        if (cc.ENABLE_PHYSICS_CHIPMUNK_DETECT) {
            if (locCurrentDecoDisplay && locCurrentDecoDisplay.getColliderDetector()) {
                locCurrentDecoDisplay.getColliderDetector().setActive(true);
            }
        }

        var displayRenderNode = locCurrentDecoDisplay == null ? null : locCurrentDecoDisplay.getDisplay();
        if (this._displayRenderNode) {
            if (this._displayRenderNode instanceof cc.Armature) {
                this._bone.setChildArmature(null);
            }
            this._displayRenderNode.removeFromParent(true);
            this._displayRenderNode.release();
            this._displayRenderNode = null;
        }

        this._displayRenderNode = displayRenderNode;

        if (displayRenderNode) {
            if (displayRenderNode instanceof cc.Armature) {
                this._bone.setChildArmature(displayRenderNode);
            }else if(displayRenderNode instanceof cc.ParticleSystem) {
                displayRenderNode.resetSystem();
            }
            if (displayRenderNode.RGBAProtocol)            {
                //this._displayRenderNode.setColor(this._bone.getColor());
                //this._displayRenderNode.setOpacity(this._bone.getOpacity());
            }
            displayRenderNode.retain();
            //todo
            //this._displayRenderNode.setVisible(this._visible);
        }
    },

    getDisplayRenderNode:function () {
        return this._displayRenderNode;
    },

    getCurrentDisplayIndex:function () {
        return this._displayIndex;
    },

    getCurrentDecorativeDisplay:function () {
        return this._currentDecoDisplay;
    },

    getDecorativeDisplayByIndex:function (index) {
        return this._decoDisplayList[index];
    },

    initDisplayList:function (boneData) {
        this._decoDisplayList = [];
        if (!boneData) {
            return;
        }
        var displayList = boneData.displayDataList;
        for (var i = 0; i < displayList.length; i++) {
            var displayData = displayList[i];
            var decoDisplay = cc.DecotativeDisplay.create();
            decoDisplay.setDisplayData(displayData);

            cc.DisplayFactory.createDisplay(this._bone, decoDisplay);

            this._decoDisplayList.push(decoDisplay);
        }
    },

    containPoint:function (point) {
        if (!this._visible || this._displayIndex < 0) {
            return false;
        }

        var ret = false;
        switch (this._currentDecoDisplay.getDisplayData().displayType) {
            case CC_DISPLAY_SPRITE:
                /*
                 *  First we first check if the point is in the sprite content rect. If false, then we continue to check
                 *  the contour point. If this step is also false, then we can say the bone not contain this point.
                 *
                 */
                var outPoint = cc.p(0, 0);
                var sprite = this._currentDecoDisplay.getDisplay();
                sprite = sprite.getChildByTag(0);
                ret = cc.SPRITE_CONTAIN_POINT_WITH_RETURN(sprite, point, outPoint);
                break;
            default:
                break;
        }
        return ret;
    },

    containPoint:function (x, y) {
        var p = cc.p(x, y);
        return this.containPoint(p);
    },


    setVisible:function (visible) {
        if (!this._displayRenderNode) {
            return;
        }
        this._visible = visible;
        this._displayRenderNode.setVisible(visible);
    },

    isVisible:function () {
        return this._visible;
    },

    getContentSize:function () {
        if (!this._displayRenderNode) {
            return  cc.size(0, 0);
        }
        return this._displayRenderNode.getContentSize();
    },

    getBoundingBox:function () {
        if (!this._displayRenderNode) {
            return cc.rect(0, 0, 0, 0);
        }
        return this._displayRenderNode.getBoundingBox();
    },

    getAnchorPoint:function () {
        if (!this._displayRenderNode) {
            return  cc.p(0, 0);
        }
        return this._displayRenderNode.getAnchorPoint();
    },

    getAnchorPointInPoints:function () {
        if (!this._displayRenderNode) {
            return  cc.p(0, 0);
        }
        return this._displayRenderNode.getAnchorPointInPoints();
    },

    getForceChangeDisplay:function () {
        return this._forceChangeDisplay;
    },

    release:function () {
        this._decoDisplayList = [];
        if (this._displayRenderNode) {
            this._displayRenderNode.removeFromParent(true);
            this._displayRenderNode = null;
        }
    }

});

cc.DisplayManager.create = function (bone) {
    var displayManager = new cc.DisplayManager();
    if (displayManager && displayManager.init(bone)) {
        return displayManager;
    }
    return null;
};