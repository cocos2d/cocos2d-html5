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

var PROPERTY_POSITION = "position";
var PROPERTY_CONTENTSIZE = "contentSize";
var PROPERTY_SKEW = "skew";
var PROPERTY_ANCHORPOINT = "anchorPoint";
var PROPERTY_SCALE = "scale";
var PROPERTY_ROTATION = "rotation";
var PROPERTY_TAG = "tag";
var PROPERTY_IGNOREANCHORPOINTFORPOSITION = "ignoreAnchorPointForPosition";
var PROPERTY_VISIBLE = "visible";

var ASSERT_FAIL_UNEXPECTED_PROPERTY = function (propertyName) {
    cc.log("Unexpected property: '" + propertyName + "'!");
};

var ASSERT_FAIL_UNEXPECTED_PROPERTYTYPE = function (propertyName) {
    cc.log("Unexpected property type: '" + propertyName + "'!");
};

function BlockData(selMenuHander, target) {
    this.selMenuHander = selMenuHander;
    this.target = target;
}

function BlockCCControlData(selCCControlHandler, target, controlEvents) {
    this.selCCControlHandler = selCCControlHandler;
    this.target = target;
    this.controlEvents = controlEvents;
}

cc.NodeLoader = cc.Class.extend({
    _customProperties: null,
    _pt: null,
    _size: null,
    _arr2: null,

    ctor: function () {
        this._customProperties = new cc._Dictionary();
        this._pt = cc.p();
        this._size = cc.size();
        this._arr2 = new Array(2);
        this._blockControlData = {
            selCCControlHandler: null,
            target: null,
            controlEvents: null
        };
    },

    loadCCNode: function (parent, ccbReader) {
        return this._createCCNode(parent, ccbReader);
        //this.parseProperties(node, parent, ccbReader);
        //return node;
    },

    parseProperties: function (node, parent, ccbReader) {
        var numRegularProps = ccbReader.readInt(false);
        var numExturaProps = ccbReader.readInt(false);
        var propertyCount = numRegularProps + numExturaProps;

        for (var i = 0; i < propertyCount; i++) {
            var isExtraProp = (i >= numRegularProps);
            var type = ccbReader.readInt(false);
            var propertyName = ccbReader.readCachedString();

            // Check if the property can be set for this platform
            var setProp = false;

            var platform = ccbReader._data[ccbReader._currentByte++];
            if ((platform === CCB_PLATFORM_ALL) || (platform === CCB_PLATFORM_IOS) || (platform === CCB_PLATFORM_MAC))
                setProp = true;

            //forward properties for sub ccb files
            if (isExtraProp) {
                if (node.ccbFileNode) {
                    node = node.ccbFileNode;
                    //skip properties that doesn't have a value to override
                    var getExtraPropsNames = node.userObject;
                    setProp = getExtraPropsNames.indexOf(propertyName) !== -1;
                } else if (node === ccbReader._animationManager.getRootNode()) {
                    var extraPropsNames = node.userObject;
                    if (!extraPropsNames) {
                        extraPropsNames = [];
                        node.userObject = extraPropsNames;
                    }
                    extraPropsNames.push(propertyName);
                }
            }  

            switch (type) {
                case CCB_PROPTYPE_POSITION:
                {
                    var position = this.parsePropTypePosition(node, parent, ccbReader, propertyName);
                    if (setProp)
                        this.onHandlePropTypePosition(node, parent, propertyName, position, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_POINT:
                {
                    var point = this.parsePropTypePoint(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypePoint(node, parent, propertyName, point, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_POINTLOCK:
                {
                    var pointLock = this.parsePropTypePointLock(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypePointLock(node, parent, propertyName, pointLock, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_SIZE:
                {
                    var size = this.parsePropTypeSize(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypeSize(node, parent, propertyName, size, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_SCALELOCK:
                {
                    var scaleLock = this.parsePropTypeScaleLock(node, parent, ccbReader, propertyName);
                    if (setProp)
                        this.onHandlePropTypeScaleLock(node, parent, propertyName, scaleLock, ccbReader);
                    break;
                }
                case CCB_PROPTYPE_FLOATXY:
                {
                    var xy = this.parsePropTypeFloatXY(node, parent, ccbReader);
                    if (setProp)
                        this.onHandlePropTypeFloatXY(node, parent, propertyName, xy, ccbReader);
                    break;
                }

                case CCB_PROPTYPE_FLOAT:
                {
                    var f = this.parsePropTypeFloat(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFloat(node, parent, propertyName, f, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_DEGREES:
                {
                    var degrees = this.parsePropTypeDegrees(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeDegrees(node, parent, propertyName, degrees, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLOATSCALE:
                {
                    var floatScale = this.parsePropTypeFloatScale(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFloatScale(node, parent, propertyName, floatScale, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_INTEGER:
                {
                    var integer = this.parsePropTypeInteger(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeInteger(node, parent, propertyName, integer, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_INTEGERLABELED:
                {
                    var integerLabeled = this.parsePropTypeIntegerLabeled(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeIntegerLabeled(node, parent, propertyName, integerLabeled, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLOATVAR:
                {
                    var floatVar = this.parsePropTypeFloatVar(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFloatVar(node, parent, propertyName, floatVar, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_CHECK:
                {
                    var check = this.parsePropTypeCheck(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeCheck(node, parent, propertyName, check, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_SPRITEFRAME:
                {
                    var ccSpriteFrame = this.parsePropTypeSpriteFrame(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeSpriteFrame(node, parent, propertyName, ccSpriteFrame, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_ANIMATION:
                {
                    var ccAnimation = this.parsePropTypeAnimation(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeAnimation(node, parent, propertyName, ccAnimation, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_TEXTURE:
                {
                    var ccTexture2D = this.parsePropTypeTexture(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeTexture(node, parent, propertyName, ccTexture2D, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BYTE:
                {
                    var byteValue = this.parsePropTypeByte(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeByte(node, parent, propertyName, byteValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_COLOR3:
                {
                    var color = this.parsePropTypeColor3(node, parent, ccbReader, propertyName);
                    if (setProp) {
                        this.onHandlePropTypeColor3(node, parent, propertyName, color, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_COLOR4VAR:
                {
                    var color4FVar = this.parsePropTypeColor4FVar(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeColor4FVar(node, parent, propertyName, color4FVar, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FLIP:
                {
                    var flip = this.parsePropTypeFlip(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFlip(node, parent, propertyName, flip, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLENDMODE:
                {
                    var blendFunc = this.parsePropTypeBlendFunc(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeBlendFunc(node, parent, propertyName, blendFunc, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FNTFILE:
                {
                    var fntFile = ccbReader.getCCBRootPath() + this.parsePropTypeFntFile(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFntFile(node, parent, propertyName, fntFile, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_FONTTTF:
                {
                    var fontTTF = this.parsePropTypeFontTTF(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeFontTTF(node, parent, propertyName, fontTTF, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_STRING:
                {
                    var stringValue = this.parsePropTypeString(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeString(node, parent, propertyName, stringValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_TEXT:
                {
                    var textValue = this.parsePropTypeText(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeText(node, parent, propertyName, textValue, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLOCK:
                {
                    var blockData = this.parsePropTypeBlock(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeBlock(node, parent, propertyName, blockData, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_BLOCKCCCONTROL:
                {
                    var blockCCControlData = this.parsePropTypeBlockCCControl(node, parent, ccbReader);
                    if (setProp && blockCCControlData != null) {
                        this.onHandlePropTypeBlockCCControl(node, parent, propertyName, blockCCControlData, ccbReader);
                    }
                    break;
                }
                case CCB_PROPTYPE_CCBFILE:
                {
                    var ccbFileNode = this.parsePropTypeCCBFile(node, parent, ccbReader);
                    if (setProp) {
                        this.onHandlePropTypeCCBFile(node, parent, propertyName, ccbFileNode, ccbReader);
                    }
                    break;
                }
                default:
                    ASSERT_FAIL_UNEXPECTED_PROPERTYTYPE(type);
                    break;
            }
        }
    },

    getCustomProperties: function () {
        return this._customProperties;
    },

    _createCCNode: function (parent, ccbReader) {
        return new cc.Node();
    },

    parsePropTypePosition: function (node, parent, ccbReader, propertyName) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        var type = ccbReader.readInt(false);

        // var containerSize = ccbReader._animationManager.getContainerSize(parent);
        var containerSize = parent ? parent._contentSize : ccbReader._animationManager._rootContainerSize;
        cc.getAbsolutePosition(x, y, type, containerSize, propertyName, this._pt);
        node.setPosition(this._pt);

        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            var baseValue = [x, y, type];
            ccbReader._animationManager.setBaseValue(baseValue, node, propertyName);
        }
        return this._pt;
    },

    parsePropTypePoint: function (node, parent, ccbReader) {
        this._pt.x = ccbReader.readFloat();
        this._pt.y = ccbReader.readFloat();
        return this._pt;
    },

    parsePropTypePointLock: function (node, parent, ccbReader) {
        this._pt.x = ccbReader.readFloat();
        this._pt.y = ccbReader.readFloat();
        return this._pt;
    },

    parsePropTypeSize: function (node, parent, ccbReader) {
        var width = ccbReader.readFloat();
        var height = ccbReader.readFloat();

        var type = ccbReader.readInt(false);

        // var containerSize = ccbReader._animationManager.getContainerSize(parent);
        var containerSize = parent ? parent._contentSize : ccbReader._animationManager._rootContainerSize;

        switch (type) {
            case CCB_SIZETYPE_ABSOLUTE:
                /* Nothing. */
                break;
            case CCB_SIZETYPE_RELATIVE_CONTAINER:
                width = containerSize.width - width;
                height = containerSize.height - height;
                break;
            case CCB_SIZETYPE_PERCENT:
                width = (containerSize.width * width / 100.0);
                height = (containerSize.height * height / 100.0);
                break;
            case CCB_SIZETYPE_HORIZONTAL_PERCENT:
                width = (containerSize.width * width / 100.0);
                break;
            case CCB_SIZETYPE_VERTICAL_PERCENT:
                height = (containerSize.height * height / 100.0);
                break;
            case CCB_SIZETYPE_MULTIPLY_RESOLUTION:
                var resolutionScale = cc.BuilderReader.getResolutionScale();
                width *= resolutionScale;
                height *= resolutionScale;
                break;
            default:
                cc.log("Unknown CCB type.");
                break;
        }
        this._size.width = width;
        this._size.height = height;
        return this._size;
    },

    parsePropTypeScaleLock: function (node, parent, ccbReader, propertyName) {
        var x = ccbReader.readFloat();
        var y = ccbReader.readFloat();

        var type = ccbReader.readInt(false);

        // cc.setRelativeScale(node, x, y, type, propertyName);

        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            ccbReader._animationManager.setBaseValue([x, y, type], node, propertyName);
        }

        if (type === CCB_SCALETYPE_MULTIPLY_RESOLUTION) {
            var resolutionScale = cc.BuilderReader.getResolutionScale();
            x *= resolutionScale;
            y *= resolutionScale;
        }
        this._pt.x = x;
        this._pt.y = y;
        return this._pt;
    },

    parsePropTypeFloat: function (node, parent, ccbReader) {
        return ccbReader.readFloat();
    },

    parsePropTypeDegrees: function (node, parent, ccbReader, propertyName) {
        var degrees = ccbReader.readFloat();
        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            ccbReader._animationManager.setBaseValue(degrees, node, propertyName);
        }
        return degrees;
    },

    parsePropTypeFloatScale: function (node, parent, ccbReader) {
        var f = ccbReader.readFloat();

        var type = ccbReader.readInt(false);

        if (type === CCB_SCALETYPE_MULTIPLY_RESOLUTION) {
            f *= cc.BuilderReader.getResolutionScale();
        }

        return f;
    },

    parsePropTypeInteger: function (node, parent, ccbReader) {
        return ccbReader.readInt(true);
    },

    parsePropTypeIntegerLabeled: function (node, parent, ccbReader) {
        return ccbReader.readInt(true);
    },

    parsePropTypeFloatVar: function (node, parent, ccbReader) {
        this._arr2[0] = ccbReader.readFloat();
        this._arr2[1] = ccbReader.readFloat();
        return this._arr2;
    },

    parsePropTypeCheck: function (node, parent, ccbReader, propertyName) {
        var check = !!ccbReader._data[ccbReader._currentByte++];
        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            ccbReader._animationManager.setBaseValue(check, node, propertyName);
        }
        return check;
    },

    parsePropTypeSpriteFrame: function (node, parent, ccbReader, propertyName) {
        var spriteSheet = ccbReader.readCachedString();
        var spriteFile = ccbReader.readCachedString();

        var spriteFrame;
        if (spriteFile) {
            if (spriteSheet.length === 0) {
                spriteFile = ccbReader._ccbRootPath + spriteFile;
                var texture = cc.textureCache.addImage(spriteFile);

                var locContentSize = texture.getContentSize();
                var bounds = cc.rect(0, 0, locContentSize.width, locContentSize.height);
                spriteFrame = new cc.SpriteFrame(texture, bounds);
            } else {
                var frameCache = cc.spriteFrameCache;
                spriteSheet = ccbReader._ccbRootPath + spriteSheet;
                //load the sprite sheet only if it is not loaded
                if (ccbReader._loadedSpriteSheets.indexOf(spriteSheet) === -1) {
                    frameCache.addSpriteFrames(spriteSheet);
                    ccbReader._loadedSpriteSheets.push(spriteSheet);
                }
                spriteFrame = frameCache.getSpriteFrame(spriteFile);
            }
            if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
                ccbReader._animationManager.setBaseValue(spriteFrame, node, propertyName);
            }
        }

        return spriteFrame;
    },

    parsePropTypeAnimation: function (node, parent, ccbReader) {
        var animationFile = ccbReader._ccbRootPath + ccbReader.readCachedString();
        var animation = ccbReader.readCachedString();

        var ccAnimation = null;

        // Support for stripping relative file paths, since ios doesn't currently
        // know what to do with them, since its pulling from bundle.
        // Eventually this should be handled by a client side asset manager
        // interface which figured out what resources to load.
        // TODO Does this problem exist in C++?
        animation = cc.BuilderReader.lastPathComponent(animation);
        animationFile = cc.BuilderReader.lastPathComponent(animationFile);

        if (animation) {
            var animationCache = cc.animationCache;
            animationCache.addAnimations(animationFile);

            ccAnimation = animationCache.getAnimation(animation);
        }
        return ccAnimation;
    },

    parsePropTypeTexture: function (node, parent, ccbReader) {
        var spriteFile = ccbReader._ccbRootPath + ccbReader.readCachedString();

        if (spriteFile)
            return cc.textureCache.addImage(spriteFile);
        return null;
    },

    parsePropTypeByte: function (node, parent, ccbReader, propertyName) {
        var ret = ccbReader._data[ccbReader._currentByte++];
        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            ccbReader._animationManager.setBaseValue(ret, node, propertyName);
        }
        return ret;
    },

    parsePropTypeColor3: function (node, parent, ccbReader, propertyName) {
        var red = ccbReader._data[ccbReader._currentByte++];
        var green = ccbReader._data[ccbReader._currentByte++];
        var blue = ccbReader._data[ccbReader._currentByte++];
        var color = cc.color(red, green, blue);
        if (ccbReader._animatedProps.indexOf(propertyName) > -1) {
            ccbReader._animationManager.setBaseValue(color, node, propertyName);
        }
        return color;
    },

    parsePropTypeColor4FVar: function (node, parent, ccbReader) {
        //TODO Color4F doesn't supports on HTML5
        var red = 0 | (ccbReader.readFloat() * 255);
        var green = 0 | (ccbReader.readFloat() * 255);
        var blue = 0 | (ccbReader.readFloat() * 255);
        var alpha = ccbReader.readFloat();
        alpha = alpha <= 1 ? (0 | (alpha * 255)) : alpha;
        var redVar = 0 | (ccbReader.readFloat() * 255);
        var greenVar = 0 | (ccbReader.readFloat() * 255);
        var blueVar = 0 | (ccbReader.readFloat() * 255);
        var alphaVar = ccbReader.readFloat();
        alphaVar = alphaVar <= 1 ? (0 | (alphaVar * 255)) : alphaVar;

        this._arr2[0] = {r: red, g: green, b: blue, a: alpha};
        this._arr2[1] = {r: redVar, g: greenVar, b: blueVar, a: alphaVar};

        return this._arr2;
    },

    parsePropTypeFlip: function (node, parent, ccbReader) {
        this._arr2[0] = !!ccbReader._data[ccbReader._currentByte++];
        this._arr2[1] = !!ccbReader._data[ccbReader._currentByte++];

        return this._arr2;
    },

    parsePropTypeBlendFunc: function (node, parent, ccbReader) {
        var source = ccbReader.readInt(false);
        var destination = ccbReader.readInt(false);

        return new cc.BlendFunc(source, destination);
    },

    parsePropTypeFntFile: function (node, parent, ccbReader) {
        return ccbReader.readCachedString();
    },

    parsePropTypeString: function (node, parent, ccbReader) {
        return ccbReader.readCachedString();
    },

    parsePropTypeText: function (node, parent, ccbReader) {
        return ccbReader.readCachedString();
    },

    parsePropTypeFontTTF: function (node, parent, ccbReader) {
        return ccbReader.readCachedString();
        //var ttfEnding = ".ttf";

        //TODO Fix me if it is wrong
        /* If the fontTTF comes with the ".ttf" extension, prepend the absolute path.
         * System fonts come without the ".ttf" extension and do not need the path prepended. */
        /*if (cc.CCBReader.endsWith(fontTTF.toLowerCase(), ttfEnding)) {
         fontTTF = ccbReader.getCCBRootPath() + fontTTF;
         }*/
    },

    parsePropTypeBlock: function (node, parent, ccbReader) {
        var selectorName = ccbReader.readCachedString();
        var selectorTarget = ccbReader.readInt(false);

        if (selectorTarget !== CCB_TARGETTYPE_NONE) {
            var target = null;
            if (!ccbReader._jsControlled) {
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    target = ccbReader._animationManager._rootNode;
                } else if (selectorTarget === CCB_TARGETTYPE_OWNER) {
                    target = ccbReader._owner;
                }

                if (target !== null) {
                    if (selectorName.length > 0) {
                        var selMenuHandler = 0;

                        //var targetAsCCBSelectorResolver = target;
                        if (target.onResolveCCBCCMenuItemSelector)
                            selMenuHandler = target.onResolveCCBCCMenuItemSelector(target, selectorName);

                        if (selMenuHandler === 0) {
                            var ccbSelectorResolver = ccbReader._ccbSelectorResolver;
                            if (ccbSelectorResolver)
                                selMenuHandler = ccbSelectorResolver.onResolveCCBCCMenuItemSelector(target, selectorName);
                        }

                        if (selMenuHandler === 0) {
                            cc.log("Skipping selector '" + selectorName + "' since no CCBSelectorResolver is present.");
                        } else {
                            return new BlockData(selMenuHandler, target);
                        }
                    } else {
                        cc.log("Unexpected empty selector.");
                    }
                } else {
                    cc.log("Unexpected NULL target for selector.");
                }
            } else {
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    ccbReader.addDocumentCallbackNode(node);
                    ccbReader.addDocumentCallbackName(selectorName);
                    ccbReader.addDocumentCallbackControlEvents(0);
                } else {
                    ccbReader.addOwnerCallbackNode(node);
                    ccbReader.addOwnerCallbackName(selectorName);
                    ccbReader.addOwnerCallbackControlEvents(0);
                }
            }
        }
        return null;
    },

    parsePropTypeBlockCCControl: function (node, parent, ccbReader) {
        var selectorName = ccbReader.readCachedString();
        var selectorTarget = ccbReader.readInt(false);
        var controlEvents = ccbReader.readInt(false);

        if (selectorTarget !== CCB_TARGETTYPE_NONE) {
            if (!ccbReader._jsControlled) {
                var target = null;
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    target = ccbReader._animationManager._rootNode;
                } else if (selectorTarget === CCB_TARGETTYPE_OWNER) {
                    target = ccbReader._owner;
                }

                if (target !== null) {
                    if (selectorName.length > 0) {
                        var selCCControlHandler = 0;

                        if (target.onResolveCCBCCControlSelector) {
                            selCCControlHandler = target.onResolveCCBCCControlSelector(target, selectorName);
                        }
                        if (selCCControlHandler === 0) {
                            var ccbSelectorResolver = ccbReader._ccbSelectorResolver;
                            if (ccbSelectorResolver != null) {
                                selCCControlHandler = ccbSelectorResolver.onResolveCCBCCControlSelector(target, selectorName);
                            }
                        }

                        if (selCCControlHandler === 0) {
                            cc.log("Skipping selector '" + selectorName + "' since no CCBSelectorResolver is present.");
                        } else {
                            this._blockControlData.selCCControlHandler = selCCControlHandler;
                            this._blockControlData.target = target;
                            this._blockControlData.controlEvents = controlEvents;
                            return this._blockControlData;
                        }
                    } else {
                        cc.log("Unexpected empty selector.");
                    }
                } else {
                    cc.log("Unexpected NULL target for selector.");
                }
            } else {
                if (selectorTarget === CCB_TARGETTYPE_DOCUMENTROOT) {
                    ccbReader.addDocumentCallbackNode(node);
                    ccbReader.addDocumentCallbackName(selectorName);
                    ccbReader.addDocumentCallbackControlEvents(controlEvents);
                } else {
                    ccbReader.addOwnerCallbackNode(node);
                    ccbReader.addOwnerCallbackName(selectorName);
                    ccbReader.addOwnerCallbackControlEvents(controlEvents);
                }
            }
        }
        return null;
    },

    parsePropTypeCCBFile: function (node, parent, ccbReader) {
        var ccbFileName = ccbReader._ccbRootPath + ccbReader.readCachedString();

        /* Change path extension to .ccbi. */
        var ccbFileWithoutPathExtension = cc.BuilderReader.deletePathExtension(ccbFileName);
        ccbFileName = ccbFileWithoutPathExtension + ".ccbi";

        var myCCBReader = new cc.BuilderReader(ccbReader);

        var bytes = cc.loader.getRes(ccbFileName);
        if (!bytes) {
            var realUrl = cc.loader.getUrl(ccbFileName);
            realUrl = hlddz.convertToDownloadURL(realUrl);
            bytes = cc.loader.loadBinarySync(realUrl);
            cc.loader.cache[ccbFileName] = bytes;
        }

        myCCBReader.initWithData(bytes, ccbReader._owner);
        myCCBReader._animationManager.setRootContainerSize(parent._contentSize);
        myCCBReader.setAnimationManagers(ccbReader._animationManagers);

        myCCBReader._animationManager.setOwner(ccbReader._owner);
        var ccbFileNode = myCCBReader.readFileWithCleanUp(false);
        ccbReader.setAnimationManagers(myCCBReader._animationManagers);

        if (ccbFileNode && myCCBReader._animationManager._autoPlaySequenceId !== -1)
            myCCBReader._animationManager.runAnimations(myCCBReader._animationManager._autoPlaySequenceId, 0);

        return ccbFileNode;
    },

    parsePropTypeFloatXY: function (node, parent, ccbReader) {
        this._pt.x = ccbReader.readFloat();
        this._pt.y = ccbReader.readFloat();
        return this._pt;
    },

    onHandlePropTypePosition: function (node, parent, propertyName, position, ccbReader) {
        if (propertyName === PROPERTY_POSITION) {
            node.setPosition(position);
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypePoint: function (node, parent, propertyName, position, ccbReader) {
        if (propertyName === PROPERTY_ANCHORPOINT) {
            node.setAnchorPoint(position);
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypePointLock: function (node, parent, propertyName, pointLock, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeSize: function (node, parent, propertyName, sizeValue, ccbReader) {
        if (propertyName === PROPERTY_CONTENTSIZE) {
            node.setContentSize(sizeValue);
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeScaleLock: function (node, parent, propertyName, scaleLock, ccbReader) {
        if (propertyName === PROPERTY_SCALE) {
            node.setScale(scaleLock.x, scaleLock.y);
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },
    onHandlePropTypeFloatXY: function (node, parent, propertyName, xy, ccbReader) {
        if (propertyName === PROPERTY_SKEW) {
            node._skewX = xy.x;
            node._skewY = xy.y;
        } else {
            var nameX = propertyName + "X";
            var nameY = propertyName + "Y";
            if (!node[nameX] || !node[nameY])
                ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
            //TODO throw an error when source code was confused
            node[nameX](xy.x);
            node[nameY](xy.y);
        }
    },
    onHandlePropTypeFloat: function (node, parent, propertyName, floatValue, ccbReader) {
        //ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        // It may be a custom property, add it to custom property dictionary.
        this._customProperties.setObject(floatValue, propertyName);
    },

    onHandlePropTypeDegrees: function (node, parent, propertyName, degrees, ccbReader) {
        if (propertyName === PROPERTY_ROTATION) {
            node.setRotation(degrees);
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeFloatScale: function (node, parent, propertyName, floatScale, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeInteger: function (node, parent, propertyName, integer, ccbReader) {
        if (propertyName === PROPERTY_TAG) {
            node.tag = integer;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeIntegerLabeled: function (node, parent, propertyName, integerLabeled, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeFloatVar: function (node, parent, propertyName, floatVar, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeCheck: function (node, parent, propertyName, check, ccbReader) {
        if (propertyName === PROPERTY_VISIBLE) {
            node._visible = check;
        } else if (propertyName === PROPERTY_IGNOREANCHORPOINTFORPOSITION) {
            node._ignoreAnchorPointForPosition = check;
        } else {
            ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        }
    },

    onHandlePropTypeSpriteFrame: function (node, parent, propertyName, spriteFrame, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeAnimation: function (node, parent, propertyName, ccAnimation, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },

    onHandlePropTypeTexture: function (node, parent, propertyName, ccTexture2D, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeByte: function (node, parent, propertyName, byteValue, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeColor3: function (node, parent, propertyName, ccColor3B, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeColor4FVar: function (node, parent, propertyName, ccColor4FVar, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeFlip: function (node, parent, propertyName, flip, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeBlendFunc: function (node, parent, propertyName, ccBlendFunc, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeFntFile: function (node, parent, propertyName, fntFile, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeString: function (node, parent, propertyName, strValue, ccbReader) {
        //ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
        // It may be a custom property, add it to custom property dictionary.
        this._customProperties.setObject(strValue, propertyName);
    },
    onHandlePropTypeText: function (node, parent, propertyName, textValue, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeFontTTF: function (node, parent, propertyName, fontTTF, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeBlock: function (node, parent, propertyName, blockData, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeBlockCCControl: function (node, parent, propertyName, blockCCControlData, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    },
    onHandlePropTypeCCBFile: function (node, parent, propertyName, ccbFileNode, ccbReader) {
        ASSERT_FAIL_UNEXPECTED_PROPERTY(propertyName);
    }
});

cc.NodeLoader.loader = function () {
    return new cc.NodeLoader();
};
