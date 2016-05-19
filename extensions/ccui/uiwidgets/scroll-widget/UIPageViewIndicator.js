/****************************************************************************
 Copyright (c) 2015 Neo Kim (neo.kim@neofect.com)
 Copyright (c) 2015 Nikita Besshaposhnikov (nikita.besshaposhnikov@gmail.com)

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
 * The PageViewIndicator control of Cocos UI <br/>
 * Indicator being attached to page view.
 * @class
 * @extends ccui.ProtectedNode
 * @property {Number}               spaceBetweenIndexNodes             - Space between index nodes in PageViewIndicator
 */
ccui.PageViewIndicator = ccui.ProtectedNode.extend(/** @lends ccui.PageViewIndicator# */{
    _direction: null,
    _indexNodes: null,
    _currentIndexNode: null,
    _spaceBetweenIndexNodes: 0,
    _indexNodesScale: 1.0,
    _indexNodesColor: null,
    _useDefaultTexture: true,
    _indexNodesTextureFile: "",
    _indexNodesTexType: ccui.Widget.LOCAL_TEXTURE,

    _className: "PageViewIndicator",

    /**
     * Allocates and initializes a PageViewIndicator.
     * Constructor of ccui.PageViewIndicator. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     */
    ctor: function () {
        cc.ProtectedNode.prototype.ctor.call(this);

        this._direction = ccui.ScrollView.DIR_HORIZONTAL;
        this._indexNodes = [];
        this._spaceBetweenIndexNodes = ccui.PageViewIndicator.SPACE_BETWEEN_INDEX_NODES_DEFAULT;
        this._indexNodesColor = cc.color.WHITE;

        var image =  new Image();
        image.src = ccui.PageViewIndicator.CIRCLE_IMAGE;

        this._currentIndexNode = new cc.Sprite(image);
        this._currentIndexNode.setVisible(false);
        this.addProtectedChild(this._currentIndexNode, 1);

        // this.setCascadeColorEnabled(true);
        // this.setCascadeOpacityEnabled(true);
    },

    /**
     * Sets direction of indicator
     * @param {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH} direction
     */
    setDirection: function(direction)
    {
        this._direction = direction;
        this._rearrange();
    },

    /**
     * resets indicator with new page count.
     * @param {number} numberOfTotalPages
     */
    reset: function(numberOfTotalPages)
    {
        while(this._indexNodes.length < numberOfTotalPages)
        {
            this._increaseNumberOfPages();
        }
        while(this._indexNodes.length > numberOfTotalPages)
        {
            this._decreaseNumberOfPages();
        }
        this._rearrange();
        this._currentIndexNode.setVisible(this._indexNodes.length > 0);
    },

    /**
     * Indicates node by index
     * @param {number} index
     */
    indicate: function(index)
    {
        if (index < 0 || index >= this._indexNodes.length)
        {
            return;
        }
        this._currentIndexNode.setPosition(this._indexNodes[index].getPosition());
    },

    _rearrange: function()
    {
        if(this._indexNodes.length === 0)
        {
            return;
        }

        var horizontal = (this._direction === ccui.ScrollView.DIR_HORIZONTAL);

        // Calculate total size
        var indexNodeSize = this._indexNodes[0].getContentSize();
        var sizeValue = (horizontal ? indexNodeSize.width : indexNodeSize.height);

        var numberOfItems = this._indexNodes.length;
        var totalSizeValue = sizeValue * numberOfItems + this._spaceBetweenIndexNodes * (numberOfItems - 1);

        var posValue = -(totalSizeValue / 2) + (sizeValue / 2);
        for(var i = 0; i < this._indexNodes.length; ++i)
        {
            var position;
            if(horizontal)
            {
                position = cc.p(posValue, indexNodeSize.height / 2.0);
            }
            else
            {
                position = cc.p(indexNodeSize.width / 2.0, -posValue);
            }
            this._indexNodes[i].setPosition(position);
            posValue += sizeValue + this._spaceBetweenIndexNodes;
        }
    },

    /**
     * Sets space between index nodes.
     * @param {number} spaceBetweenIndexNodes
     */
    setSpaceBetweenIndexNodes: function(spaceBetweenIndexNodes)
    {
        if(this._spaceBetweenIndexNodes === spaceBetweenIndexNodes)
        {
            return;
        }
        this._spaceBetweenIndexNodes = spaceBetweenIndexNodes;
        this._rearrange();
    },

    /**
     * Gets space between index nodes.
     * @returns {number}
     */
    getSpaceBetweenIndexNodes: function()
    {
        return this._spaceBetweenIndexNodes;
    },

    /**
     * Sets color of selected index node
     * @param {cc.Color} color
     */
    setSelectedIndexColor: function(color)
    {
        this._currentIndexNode.setColor(color);
    },

    /**
     * Gets color of selected index node
     * @returns {cc.Color}
     */
    getSelectedIndexColor: function()
    {
        return this._currentIndexNode.getColor();
    },

    /**
     * Sets color of index nodes
     * @param {cc.Color} indexNodesColor
     */
    setIndexNodesColor: function(indexNodesColor)
    {
        this._indexNodesColor = indexNodesColor;

        for(var  i = 0 ; i < this._indexNodes.length; ++i)
        {
            this._indexNodes[i].setColor(indexNodesColor);
        }
    },

    /**
     * Gets color of index nodes
     * @returns {cc.Color}
     */
    getIndexNodesColor: function()
    {
        var locRealColor = this._indexNodesColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    /**
     * Sets scale of index nodes
     * @param {Number} indexNodesScale
     */
    setIndexNodesScale: function(indexNodesScale)
    {
        if(this._indexNodesScale === indexNodesScale)
        {
            return;
        }
        this._indexNodesScale = indexNodesScale;

        this._currentIndexNode.setScale(indexNodesScale);

        for(var  i = 0 ; i < this._indexNodes.length; ++i)
        {
            this._indexNodes[i].setScale(this,_indexNodesScale);
        }

        this._rearrange();
    },

    /**
     * Gets scale of index nodes
     * @returns {Number}
     */
    getIndexNodesScale: function()
    {
        return this._indexNodesScale;
    },

    /**
     * Sets texture of index nodes
     * @param {String} texName
     * @param {ccui.Widget.LOCAL_TEXTURE | ccui.Widget.PLIST_TEXTURE} [texType = ccui.Widget.LOCAL_TEXTURE]
     */
    setIndexNodesTexture: function(texName, texType)
    {
        if(texType === undefined)
            texType = ccui.Widget.LOCAL_TEXTURE;
        
        this._useDefaultTexture = false;
        this._indexNodesTextureFile = texName;
        this._indexNodesTexType = texType;

        switch (texType)
        {
            case ccui.Widget.LOCAL_TEXTURE:
                this._currentIndexNode.setTexture(texName);
                for(var  i = 0 ; i < this._indexNodes.length; ++i)
                {
                    this._indexNodes[i].setTexture(texName);
                }
                break;
            case ccui.Widget.PLIST_TEXTURE:
                this._currentIndexNode.setSpriteFrame(texName);
                for(var  i = 0 ; i < this._indexNodes.length; ++i)
                {
                    this._indexNodes[i].setSpriteFrame(texName);
                }
                break;
            default:
                break;
        }

        this._rearrange();
    },

    _increaseNumberOfPages: function()
    {
        var indexNode;

        if(this._useDefaultTexture)
        {
            var image =  new Image();
            image.src = ccui.PageViewIndicator.CIRCLE_IMAGE;

            indexNode = new cc.Sprite(image);
        }
        else
        {
            indexNode = new cc.Sprite();
            switch (this._indexNodesTexType)
            {
                case ccui.Widget.LOCAL_TEXTURE:
                    indexNode.initWithFile(this._indexNodesTextureFile);
                    break;
                case  ccui.Widget.PLIST_TEXTURE:
                    indexNode.initWithSpriteFrameName(this._indexNodesTextureFile);
                    break;
                default:
                    break;
            }
        }

        indexNode.setColor(this._indexNodesColor);
        indexNode.setScale(this._indexNodesScale);

        this.addProtectedChild(indexNode);
        this._indexNodes.push(indexNode);
    },

    _decreaseNumberOfPages: function()
    {
        if(this._indexNodes.length === 0)
        {
            return;
        }
        this.removeProtectedChild(this._indexNodes[0]);
        this._indexNodes.splice(0, 1);
    },

    /**
     * Removes all index nodes.
     */
    clear: function()
    {
        for(var i = 0; i < this._indexNodes.length; ++i)
        {
            this.removeProtectedChild(this._indexNodes[i]);
        }
        this._indexNodes.length = 0;
        this._currentIndexNode.setVisible(false);
    }

});

var _p = ccui.PageViewIndicator.prototype;

// Extended properties
/** @expose */
_p.spaceBetweenIndexNodes;
cc.defineGetterSetter(_p, "spaceBetweenIndexNodes", _p.getSpaceBetweenIndexNodes, _p.setSpaceBetweenIndexNodes);
/**
 * @ignore
 */
ccui.PageViewIndicator.SPACE_BETWEEN_INDEX_NODES_DEFAULT = 23;
ccui.PageViewIndicator.CIRCLE_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAA8ElEQVRIx62VyRGCQBBF+6gWRCEmYDIQkhiBCgHhSclC8YqWzOV5oVzKAYZp3r1/9fpbxAIBMTsKrjx5cqVgR0wgLhCRUWOjJiPqD56xoaGPhpRZV/iSEy6crHmw5oIrF9b/lVeMofrJgjlnxlIy/wik+JB+mme8BExbBhm+5CJC2LE2LtSEQoyGWDioBA5CoRIohJtK4CYDxzNEM4GAugR1E9VjVC+SZpXvhCJCrjomESLvc17pDGX7bWmlh6UtpjPVCWy9zaJ0TD7qfm3pwERMz2trRVZk3K3BD/L34AY+dEDCniMVBkPFkT2J/b2/AIV+dRpFLOYoAAAAAElFTkSuQmCC";