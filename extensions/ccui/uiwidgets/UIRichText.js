/****************************************************************************
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

/**
 * Base class for ccui.RichElement
 * @class
 * @extends ccui.Class
 */
ccui.RichElement = ccui.Class.extend(/** @lends ccui.RichElement# */{
    _type: 0,
    _tag: 0,
    _color: null,
    _opacity:0,
    ctor: function () {
        this._type = 0;
        this._tag = 0;
        this._color = cc.color(255, 255, 255, 255);
    },
    init: function (tag, color, opacity) {
        this._tag = tag;
        this._color.r = color.r;
        this._color.g = color.g;
        this._color.b = color.b;
        this._opacity = opacity;
        if(opacity === undefined)
            this._color.a = color.a;
        else
            this._color.a = opacity;
    }
});

/**
 * Base class for ccui.RichElementText
 * @class
 * @extends ccui.RichElement
 */
ccui.RichElementText = ccui.RichElement.extend(/** @lends ccui.RichElementText# */{
    _text: "",
    _fontName: "",
    _fontSize: 0,
    ctor: function (tag, color, opacity, text, fontName, fontSize) {
        ccui.RichElement.prototype.ctor.call(this);
        this._type = ccui.RichElement.TEXT;
        this._text = "";
        this._fontName = "";
        this._fontSize = 0;

        fontSize && this.init(tag, color, opacity, text, fontName, fontSize);
    },
    init: function (tag, color, opacity, text, fontName, fontSize) {
        ccui.RichElement.prototype.init.call(this, tag, color, opacity);
        this._text = text;
        this._fontName = fontName;
        this._fontSize = fontSize;
    }
});

/**
 * Create a richElementText
 * @deprecated
 * @param {Number} tag
 * @param {cc.Color} color
 * @param {Number} opacity
 * @param {String} text
 * @param {String} fontName
 * @param {Number} fontSize
 * @returns {ccui.RichElementText}
 */
ccui.RichElementText.create = function (tag, color, opacity, text, fontName, fontSize) {
    return new ccui.RichElementText(tag, color, opacity, text, fontName, fontSize);
};

/**
 * Base class for ccui.RichElementImage
 * @class
 * @extends ccui.RichElement
 */
ccui.RichElementImage = ccui.RichElement.extend(/** @lends ccui.RichElementImage# */{
    _filePath: "",
    _textureRect: null,
    _textureType: 0,
    ctor: function (tag, color, opacity, filePath) {
        ccui.RichElement.prototype.ctor.call(this);
        this._type = ccui.RichElement.IMAGE;
        this._filePath = "";
        this._textureRect = cc.rect(0, 0, 0, 0);
        this._textureType = 0;

        filePath && this.init(tag, color, opacity, filePath);
    },
    init: function (tag, color, opacity, filePath) {
        ccui.RichElement.prototype.init.call(this, tag, color, opacity);
        this._filePath = filePath;
    }
});

/**
 * Create a richElementImage
 * @deprecated
 * @param {Number} tag
 * @param {cc.Color} color
 * @param {Number} opacity
 * @param {String} filePath
 * @returns {ccui.RichElementImage}
 */
ccui.RichElementImage.create = function (tag, color, opacity, filePath) {
    return new ccui.RichElementImage(tag, color, opacity, filePath);
};

/**
 * Base class for ccui.RichElementCustomNode
 * @class
 * @extends ccui.RichElement
 */
ccui.RichElementCustomNode = ccui.RichElement.extend(/** @lends ccui.RichElementCustomNode# */{
    _customNode: null,
    ctor: function (tag, color, opacity, customNode) {
        ccui.RichElement.prototype.ctor.call(this);
        this._type = ccui.RichElement.CUSTOM;
        this._customNode = null;

        customNode && this.init(tag, color, opacity, customNode);
    },
    init: function (tag, color, opacity, customNode) {
        ccui.RichElement.prototype.init.call(this, tag, color, opacity);
        this._customNode = customNode;
    }
});

/**
 * Create a richElementCustomNode
 * @deprecated
 * @param {Number} tag
 * @param {Number} color
 * @param {Number} opacity
 * @param {cc.Node} customNode
 * @returns {ccui.RichElementCustomNode}
 */
ccui.RichElementCustomNode.create = function (tag, color, opacity, customNode) {
    return new ccui.RichElementCustomNode(tag, color, opacity, customNode);
};

/**
 * Base class for ccui.RichText
 * @class
 * @extends ccui.Widget
 */
ccui.RichText = ccui.Widget.extend(/** @lends ccui.RichText# */{
    _formatTextDirty: false,
    _richElements: null,
    _elementRenders: null,
    _leftSpaceWidth: 0,
    _verticalSpace: 0,
    _elementRenderersContainer: null,

    /**
     * create a rich text
     * Constructor of ccui.RichText
     * @example
     * var uiRichText = new ccui.RichTex();
     */
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
        this._formatTextDirty = false;
        this._richElements = [];
        this._elementRenders = [];
        this._leftSpaceWidth = 0;
        this._verticalSpace = 0;
    },

    _initRenderer: function () {
        this._elementRenderersContainer = cc.Node.create();
        this._elementRenderersContainer.setAnchorPoint(0.5, 0.5);
        this.addProtectedChild(this._elementRenderersContainer, 0, -1);
    },

    /**
     * Insert a element
     * @param {ccui.RichElement} element
     * @param {Number} index
     */
    insertElement: function (element, index) {
        this._richElements.splice(index, 0, element);
        this._formatTextDirty = true;
    },

    /**
     * Push a element
     * @param {ccui.RichElement} element
     */
    pushBackElement: function (element) {
        this._richElements.push(element);
        this._formatTextDirty = true;
    },

    /**
     * Remove element
     * @param {ccui.RichElement} element
     */
    removeElement: function (element) {
        if (typeof element === "number")
            this._richElements.splice(element, 1);
         else
            cc.arrayRemoveObject(this._richElements, element);
        this._formatTextDirty = true;
    },

    formatText: function () {
        if (this._formatTextDirty) {
            this._elementRenderersContainer.removeAllChildren();
            this._elementRenders.length = 0;
            var i, element, locRichElements = this._richElements;
            if (this._ignoreSize) {
                this._addNewLine();
                for (i = 0; i < locRichElements.length; i++) {
                    element = locRichElements[i];
                    var elementRenderer = null;
                    switch (element._type) {
                        case ccui.RichElement.TEXT:
                            //todo: There may be ambiguous
                            elementRenderer = cc.LabelTTF.create(element._text, element._fontName, element._fontSize);
                            break;
                        case ccui.RichElement.IMAGE:
                            elementRenderer = cc.Sprite.create(element._filePath);
                            break;
                        case ccui.RichElement.CUSTOM:
                            elementRenderer = element._customNode;
                            break;
                        default:
                            break;
                    }
                    elementRenderer.setColor(element._color);
                    elementRenderer.setOpacity(element._color.a);
                    this._pushToContainer(elementRenderer);
                }
            } else {
                this._addNewLine();
                for (i = 0; i < locRichElements.length; i++) {
                    element = locRichElements[i];
                    switch (element._type) {
                        case ccui.RichElement.TEXT:
                            this._handleTextRenderer(element._text, element._fontName, element._fontSize, element._color);
                            break;
                        case ccui.RichElement.IMAGE:
                            this._handleImageRenderer(element._filePath, element._color, element._color.a);
                            break;
                        case ccui.RichElement.CUSTOM:
                            this._handleCustomRenderer(element._customNode);
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
     * @param {cc.Color} color
     */
    _handleTextRenderer: function (text, fontName, fontSize, color) {
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
                leftRenderer.setOpacity(color.a);
                this._pushToContainer(leftRenderer);
            }

            this._addNewLine();
            this._handleTextRenderer(cutWords, fontName, fontSize, color);
        } else {
            textRenderer.setColor(color);
            textRenderer.setOpacity(color.a);
            this._pushToContainer(textRenderer);
        }
    },

    /**
     * Handle image renderer
     * @param {String} filePath
     * @param {cc.Color} color
     * @param {Number} opacity
     */
    _handleImageRenderer: function (filePath, color, opacity) {
        var imageRenderer = cc.Sprite.create(filePath);
        this._handleCustomRenderer(imageRenderer);
    },

    _formarRenderers: function(){},

    /**
     * Handle custom renderer
     * @param {cc.Node} renderer
     */
    _handleCustomRenderer: function (renderer) {
        var imgSize = renderer.getContentSize();
        this._leftSpaceWidth -= imgSize.width;
        if (this._leftSpaceWidth < 0) {
            this._addNewLine();
            this._pushToContainer(renderer);
            this._leftSpaceWidth -= imgSize.width;
        } else
            this._pushToContainer(renderer);
    },

    _addNewLine: function () {
        this._leftSpaceWidth = this._customSize.width;
        this._elementRenders.push([]);
    },

    formatRenderers: function () {
        var newContentSizeHeight = 0, locRenderersContainer = this._elementRenderersContainer;
        var locElementRenders = this._elementRenders;
        var i, j, row, nextPosX, l;
        if (this._ignoreSize) {
            var newContentSizeWidth = 0;
            row = locElementRenders[0];
            nextPosX = 0;
            for (j = 0; j < row.length; j++) {
                l = row[j];
                l.setAnchorPoint(cc.p(0, 0));
                l.setPosition(cc.p(nextPosX, 0));
                locRenderersContainer.addChild(l, 1, j);
                var iSize = l.getContentSize();
                newContentSizeWidth += iSize.width;
                newContentSizeHeight = Math.max(newContentSizeHeight, iSize.height);
                nextPosX += iSize.width;
            }
            locRenderersContainer.setContentSize(cc.size(newContentSizeWidth, newContentSizeHeight));
        } else {
            var maxHeights = [];
            for (i = 0; i < locElementRenders.length; i++) {
                row = locElementRenders[i];
                var maxHeight = 0;
                for (j = 0; j < row.length; j++) {
                    l = row[j];
                    maxHeight = Math.max(l.getContentSize().height, maxHeight);
                }
                maxHeights[i] = maxHeight;
                newContentSizeHeight += maxHeights[i];
            }

            var nextPosY = this._customSize.height;
            for (i = 0; i < locElementRenders.length; i++) {
                row = locElementRenders[i];
                nextPosX = 0;
                nextPosY -= (maxHeights[i] + this._verticalSpace);

                for (j = 0; j < row.length; j++) {
                    l = row[j];
                    l.setAnchorPoint(cc.p(0, 0));
                    l.setPosition(cc.p(nextPosX, nextPosY));
                    locRenderersContainer.addChild(l, 1);
                    nextPosX += l.getContentSize().width;
                }
            }
            locRenderersContainer.setContentSize(this._contentSize);
        }

        var length = locElementRenders.length;
        for (i = 0; i<length; i++){
            locElementRenders[i].length = 0;
        }
        this._elementRenders.length = 0;

        this.setContentSize(this._ignoreSize?this.getVirtualRendererSize():this._customSize);
        this._updateContentSizeWithTextureSize(this._contentSize);
        locRenderersContainer.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5);
    },

    /**
     * Push renderer to container
     * @param {cc.Node} renderer
     */
    _pushToContainer: function (renderer) {
        if (this._elementRenders.length <= 0)
            return;
        this._elementRenders[this._elementRenders.length - 1].push(renderer);
    },

    visit: function (renderer, parentTransform, parentFlags) {
        if (this._enabled) {
            this.formatText();
            ccui.Widget.prototype.visit.call(this, renderer, parentTransform, parentFlags);
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
        ccui.Widget.prototype.setAnchorPoint.call(this, pt);
        this._elementRenderersContainer.setAnchorPoint(pt);
    },

    getVirtualRendererSize: function(){
        return this._elementRenderersContainer.getContentSize();
    },

    /**
     * Ignore content adapt with size
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (this._ignoreSize != ignore) {
            this._formatTextDirty = true;
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
        }
    },

    getDescription: function(){
        return "RichText";
    }
});

/**
 * create a rich text
 * @deprecated
 * @returns {RichText}
 * @example
 * var uiRichText = ccui.RichTex.create();
 */
ccui.RichText.create = function(){
    return new ccui.RichText();
};

// Constants
//Rich element type
ccui.RichElement.TEXT = 0;
ccui.RichElement.IMAGE = 1;
ccui.RichElement.CUSTOM = 2;