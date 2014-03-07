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
//Rich element type
ccs.RICH_ELEMENT_TYPE_TEXT = 0;
ccs.RICH_ELEMENT_TYPE_IMAGE = 1;
ccs.RICH_ELEMENT_TYPE_CUSTOM = 2;

/**
 * Base class for ccs.RichElement
 * @class
 * @extends ccs.Class
 */
ccs.RichElement = ccs.Class.extend(/** @lends ccs.RichElement# */{
    type: 0,
    tag: 0,
    color: null,
    opacity:0,
    ctor: function () {
        this.tag = 0;
        this.color = cc.c3b(255, 255, 255);
        this.opacity = 0;
    },
    init: function (tag, color, opacity) {
        this.tag = tag;
        this.color.r = color.r;
        this.color.g = color.g;
        this.color.b = color.b;
        this.opacity = opacity;
    }
});

/**
 * Base class for ccs.RichElementText
 * @class
 * @extends ccs.RichElement
 */
ccs.RichElementText = ccs.RichElement.extend(/** @lends ccs.RichElementText# */{
    text: "",
    fontName: "",
    fontSize: 0,
    ctor: function () {
        ccs.RichElement.prototype.ctor.call(this);
        this.type = ccs.RICH_ELEMENT_TYPE_TEXT;
        this.text = "";
        this.fontName = "";
        this.fontSize = 0;
    },
    init: function (tag, color, opacity, text, fontName, fontSize) {
        ccs.RichElement.prototype.init.call(this, tag, color, opacity);
        this.text = text;
        this.fontName = fontName;
        this.fontSize = fontSize;
    }
});

/**
 * Create a richElementText
 * @param {Number} tag
 * @param {cc.Color} color
 * @param {Number} opacity
 * @param {String} text
 * @param {String} fontName
 * @param {Number} fontSize
 * @returns {ccs.RichElementText}
 */
ccs.RichElementText.create = function (tag, color, opacity, text, fontName, fontSize) {
    var element = new ccs.RichElementText();
    element.init(tag, color, opacity, text, fontName, fontSize);
    return element;
};

/**
 * Base class for ccs.RichElementImage
 * @class
 * @extends ccs.RichElement
 */
ccs.RichElementImage = ccs.RichElement.extend(/** @lends ccs.RichElementImage# */{
    filePath: "",
    textureRect: null,
    textureType: 0,
    ctor: function () {
        ccs.RichElement.prototype.ctor.call(this);
        this.type = ccs.RICH_ELEMENT_TYPE_IMAGE;
        this.filePath = "";
        this.textureRect = cc.rect(0, 0, 0, 0);
        this.textureType = 0;
    },
    init: function (tag, color, opacity, filePath) {
        ccs.RichElement.prototype.init.call(this, tag, color, opacity);
        this.filePath = filePath;
    }
});

/**
 * Create a richElementImage
 * @param {Number} tag
 * @param {cc.Color} color
 * @param {Number} opacity
 * @param {String} filePath
 * @returns {ccs.RichElementText}
 */
ccs.RichElementImage.create = function (tag, color, opacity, filePath) {
    var element = new ccs.RichElementImage();
    element.init(tag, color, opacity, filePath);
    return element;
};

/**
 * Base class for ccs.RichElementCustomNode
 * @class
 * @extends ccs.RichElement
 */
ccs.RichElementCustomNode = ccs.RichElement.extend(/** @lends ccs.RichElementCustomNode# */{
    customNode: null,
    ctor: function () {
        ccs.RichElement.prototype.ctor.call(this);
        this.type = ccs.RICH_ELEMENT_TYPE_CUSTOM;
        this.customNode = null;
    },
    init: function (tag, color, opacity, customNode) {
        ccs.RichElement.prototype.init.call(this, tag, color, opacity);
        this.customNode = customNode;
    }
});

/**
 * Create a richElementCustomNode
 * @param {Number} tag
 * @param {Number} color
 * @param {Number} opacity
 * @param {cc.Node} customNode
 * @returns {RichElementText}
 */
ccs.RichElementCustomNode.create = function (tag, color, opacity, customNode) {
    var element = new ccs.RichElementCustomNode();
    element.init(tag, color, opacity, customNode);
    return element;
};

/**
 * Base class for ccs.RichText
 * @class
 * @extends ccs.Widget
 */
ccs.RichText = ccs.Widget.extend(/** @lends ccs.RichText# */{
    _formatTextDirty: false,
    _richElements: null,
    _elementRenders: null,
    _leftSpaceWidth: 0,
    _verticalSpace: 0,
    _elementRenderersContainer: null,

    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._formatTextDirty = false;
        this._richElements = [];
        this._elementRenders = [];
        this._leftSpaceWidth = 0;
        this._verticalSpace = 0;
        this._elementRenderersContainer = null;
    },

    initRenderer: function () {
        this._elementRenderersContainer = cc.Node.create();
        this._elementRenderersContainer.setAnchorPoint(cc.p(0.5, 0.5));
        cc.Node.prototype.addChild.call(this,this._elementRenderersContainer, 0, -1);
    },

    /**
     * Insert a element
     * @param {ccs.RichElement} element
     * @param {Number} index
     */
    insertElement: function (element, index) {
        this._richElements.splice(index, 0, element);
        this._formatTextDirty = true;
    },

    /**
     * Push a element
     * @param {ccs.RichElement} element
     */
    pushBackElement: function (element) {
        this._richElements.push(element);
        this._formatTextDirty = true;
    },

    /**
     * Remove element
     * @param {ccs.RichElement} element
     */
    removeElement: function (element) {
        if (typeof element === "number") {
            this._richElements.splice(element, 1);
        } else {
            cc.ArrayRemoveObject(this._richElements, element);
        }
        this._formatTextDirty = true;
    },

    formatText: function () {
        if (this._formatTextDirty) {
            this._elementRenderersContainer.removeAllChildren();
            this._elementRenders.length = 0;
            if (this._ignoreSize) {
                this.addNewLine();
                for (var i = 0; i < this._richElements.length; i++) {
                    var element = this._richElements[i];
                    var elementRenderer = null;
                    switch (element.type) {
                        case ccs.RICH_ELEMENT_TYPE_TEXT:
                            elementRenderer = cc.LabelTTF.create(element.text, element.fontName, element.fontSize);
                            break;
                        case ccs.RICH_ELEMENT_TYPE_IMAGE:
                            elementRenderer = cc.Sprite.create(element.filePath);
                            break;
                        case ccs.RICH_ELEMENT_TYPE_CUSTOM:
                            elementRenderer = element.customNode;
                            break;
                        default:
                            break;
                    }
                    elementRenderer.setColor(element.color);
                    elementRenderer.setOpacity(element.opacity);
                    this.pushToContainer(elementRenderer);
                }
            }
            else {
                this.addNewLine();
                for (var i = 0; i < this._richElements.length; i++) {
                    var element = this._richElements[i];
                    switch (element.type) {
                        case ccs.RICH_ELEMENT_TYPE_TEXT:
                            this.handleTextRenderer(element.text, element.fontName, element.fontSize, element.color, element.opacity);
                            break;
                        case ccs.RICH_ELEMENT_TYPE_IMAGE:
                            this.handleImageRenderer(element.filePath, element.color);
                            break;
                        case ccs.RICH_ELEMENT_TYPE_CUSTOM:
                            this.handleCustomRenderer(element.customNode);
                            break;
                        default:
                            break;
                    }
                }
            }
            this.formatRenderers();
            this._formatTextDirty = false;
        }
    },

    /**
     * Handle text renderer
     * @param {String} text
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Color3B} color
     * @param {Number} opacity
     */
    handleTextRenderer: function (text, fontName, fontSize, color, opacity) {
        var textRenderer = cc.LabelTTF.create(text, fontName, fontSize);
        var textRendererWidth = textRenderer.getContentSize().width;
        this._leftSpaceWidth -= textRendererWidth;
        if (this._leftSpaceWidth < 0) {
            var overstepPercent = (-this._leftSpaceWidth) / textRendererWidth;
            var curText = text;
            var stringLength = curText.length;
            var leftLength = stringLength * (1 - overstepPercent);
            var leftWords = curText.substr(0, leftLength);
            var cutWords = curText.substr(leftLength, curText.length - 1);
            if (leftLength > 0) {
                var leftRenderer = cc.LabelTTF.create(leftWords.substr(0, leftLength), fontName, fontSize);
                leftRenderer.setColor(color);
                textRenderer.setOpacity(opacity);
                this.pushToContainer(leftRenderer);
            }

            this.addNewLine();
            this.handleTextRenderer(cutWords, fontName, fontSize, color, opacity);
        }
        else {
            textRenderer.setColor(color);
            textRenderer.setOpacity(opacity);
            this.pushToContainer(textRenderer);
        }
    },

    /**
     * Handle image renderer
     * @param {String} filePath
     * @param {cc.Color3B} color
     * @param {Number} opacity
     */
    handleImageRenderer: function (filePath, color, opacity) {
        var imageRenderer = cc.Sprite.create(filePath);
        this.handleCustomRenderer(imageRenderer);
    },

    /**
     * Handle custom renderer
     * @param {cc.Node} renderer
     */
    handleCustomRenderer: function (renderer) {
        var imgSize = renderer.getContentSize();
        this._leftSpaceWidth -= imgSize.width;
        if (this._leftSpaceWidth < 0) {
            this.addNewLine();
            this.pushToContainer(renderer);
            this._leftSpaceWidth -= imgSize.width;
        }
        else {
            this.pushToContainer(renderer);
        }
    },

    addNewLine: function () {
        this._leftSpaceWidth = this._customSize.width;
        this._elementRenders.push([]);
    },

    formatRenderers: function () {
        if (this._ignoreSize) {
            var newContentSizeWidth = 0;
            var newContentSizeHeight = 0;

            var row = this._elementRenders[0];
            var nextPosX = 0;
            for (var j = 0; j < row.length; j++) {
                var l = row[j];
                l.setAnchorPoint(cc.p(0, 0));
                l.setPosition(cc.p(nextPosX, 0));
                this._elementRenderersContainer.addChild(l, 1, j);
                var iSize = l.getContentSize();
                newContentSizeWidth += iSize.width;
                newContentSizeHeight = Math.max(newContentSizeHeight, iSize.height);
                nextPosX += iSize.width;
            }
            this._elementRenderersContainer.setContentSize(cc.size(newContentSizeWidth, newContentSizeHeight));
        }
        else {
            var newContentSizeHeight = 0;
            var maxHeights = [];

            for (var i = 0; i < this._elementRenders.length; i++) {
                var row = this._elementRenders[i];
                var maxHeight = 0;
                for (var j = 0; j < row.length; j++) {
                    var l = row[j];
                    maxHeight = Math.max(l.getContentSize().height, maxHeight);
                }
                maxHeights[i] = maxHeight;
                newContentSizeHeight += maxHeights[i];
            }


            var nextPosY = this._customSize.height;
            for (var i = 0; i < this._elementRenders.length; i++) {
                var row = this._elementRenders[i];
                var nextPosX = 0;
                nextPosY -= (maxHeights[i] + this._verticalSpace);

                for (var j = 0; j < row.length; j++) {
                    var l = row[j];
                    l.setAnchorPoint(cc.p(0, 0));
                    l.setPosition(cc.p(nextPosX, nextPosY));
                    this._elementRenderersContainer.addChild(l, 1, i * 10 + j);
                    nextPosX += l.getContentSize().width;
                }
            }
            this._elementRenderersContainer.setContentSize(this._size);
        }
        this._elementRenders.length = 0;
        if (this._ignoreSize) {
            var s = this.getContentSize();
            this._size.width = s.width;
            this._size.height = s.height;
        }
        else {
            this._size.width = this._customSize.width;
            this._size.height = this._customSize.height;
        }
    },

    /**
     * Push renderer to container
     * @param {cc.Node} renderer
     */
    pushToContainer: function (renderer) {
        if (this._elementRenders.length <= 0) {
            return;
        }
        this._elementRenders[this._elementRenders.length - 1].push(renderer);
    },

    visit: function (ctx) {
        if (this._enabled) {
            this.formatText();
            ccs.Widget.prototype.visit.call(this, ctx);
        }
    },

    /**
     * Set vertical space
     * @param {Number} space
     */
    setVerticalSpace: function (space) {
        this._verticalSpace = space;
    },

    /**
     * Set anchor point
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        ccs.Widget.prototype.setAnchorPoint.call(this, pt);
        this._elementRenderersContainer.setAnchorPoint(pt);
    },

    /**
     * Get content size
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._elementRenderersContainer.getContentSize();
    },

    /**
     * Ignore content adapt with size
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (this._ignoreSize != ignore) {
            this._formatTextDirty = true;
            ccs.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
        }
    }
});

/**
 * create a rich text
 * @returns {RichText}
 */
ccs.RichText.create = function(){
    var richText = new ccs.RichText();
    richText.init();
    return richText;
};