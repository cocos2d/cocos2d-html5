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
    //SpriteBatchNode's canvas render command
    cc.SpriteBatchNode.CanvasRenderCmd = function(renderable){
        cc.Node.CanvasRenderCmd.call(this, renderable);

        this._texture = null;
        this._originalTexture = null;
    };

    var proto = cc.SpriteBatchNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.SpriteBatchNode.CanvasRenderCmd;

    proto.checkAtlasCapacity = function(){};

    proto.isValidChild = function(child){
        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_addChild_4);
            return false;
        }
        return true;
    };

    proto.initWithTexture = function(texture, capacity){
        this._originalTexture = texture;
        this._texture = texture;
    };

    proto.insertQuad = function(sprite, index){};

    proto.increaseAtlasCapacity = function(){};

    proto.removeQuadAtIndex = function(){};

    proto.removeAllQuads = function(){};

    proto.getTexture = function(){
        return this._texture;
    };

    proto.setTexture = function(texture){
        this._texture = texture;
        var locChildren = this._node._children;
        for (var i = 0; i < locChildren.length; i++)
            locChildren[i].setTexture(texture);
    };

    proto.updateChildrenAtlasIndex = function(){ };

    proto.getTextureAtlas = function(){};

    proto.setTextureAtlas = function(textureAtlas){};

    proto.cutting = function(sprite, index){
        var node = this._node;
        //sprite._renderCmd._setCachedParent(this._renderCmd);    //TODO need move to renderCmd
        node._children.splice(index, 0, sprite);
    }
})();