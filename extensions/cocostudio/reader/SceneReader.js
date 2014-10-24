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
 * ccs.sceneReader is the reader for Cocos Studio scene editor.
 * @class
 * @name ccs.sceneReader
 */
ccs.sceneReader = /** @lends ccs.sceneReader# */{
    _baseBath:"",
    _listener:null,
    _selector:null,
    _node: null,

    /**
     * Creates a node with json file that exported by CocoStudio scene editor
     * @param pszFileName
     * @returns {cc.Node}
     */
    createNodeWithSceneFile: function (pszFileName) {
        this._node  = null;
        do{
            this._baseBath = cc.path.dirname(pszFileName);
            var jsonDict = cc.loader.getRes(pszFileName);
            if (!jsonDict)
                throw "Please load the resource first : " + pszFileName;
            this._node = this.createObject(jsonDict, null);
            ccs.triggerManager.parse(jsonDict["Triggers"]||[]);
        }while(0);
        return this._node;
    },

    /**
     *  create UI object from data
     * @param {Object} inputFiles
     * @param {cc.Node} parenet
     * @returns {cc.Node}
     */
    createObject: function (inputFiles, parenet) {
        var className = inputFiles["classname"];
        if (className == "CCNode") {
            var gb = null;
            if (!parenet) {
                gb = new cc.Node();
            }
            else {
                gb = new cc.Node();
                parenet.addChild(gb);
            }

            this.setPropertyFromJsonDict(gb, inputFiles);

            var components = inputFiles["components"];
            for (var i = 0; i < components.length; i++) {
                var subDict = components[i];
                if (!subDict) {
                    break;
                }
                className = subDict["classname"];
                var comName = subDict["name"];

                var fileData = subDict["fileData"];
                var path = "", plistFile = "";
                var resType = 0;
                if (fileData != null) {
                    if(fileData["resourceType"] !== undefined){
                        resType = fileData["resourceType"]
                    }else{
                        resType =-1;
                    }

                    path = cc.path.join(this._baseBath, fileData["path"]);
                    plistFile = fileData["plistFile"];
                }

                var pathExtname = cc.path.extname(path);

                if (className == "CCSprite") {
                    var sprite = null;

                    if (resType == 0) {
                        if (pathExtname != ".png") continue;
                        sprite = new cc.Sprite(path);
                    }
                    else if (resType == 1) {
                        if (pathExtname != ".plist") continue;

                        plistFile = cc.path.join(this._baseBath, plistFile);
                        var pngFile = cc.path.changeExtname(plistFile, ".png");
                        cc.spriteFrameCache.addSpriteFrames(plistFile, pngFile);
                        sprite = new cc.Sprite("#" + fileData["path"]);
                    }
                    else {
                        continue;
                    }

                    var render = new ccs.ComRender(sprite, "CCSprite");
                    if (comName != null) {
                        render.setName(comName);
                    }

                    gb.addComponent(render);
                    this._callSelector(sprite, subDict);
                }
                else if (className == "CCTMXTiledMap") {
                    var tmx = null;
                    if (resType == 0) {
                        if (pathExtname != ".tmx") continue;
                        tmx = new cc.TMXTiledMap(path);
                    }
                    else {
                        continue;
                    }

                    var render = new ccs.ComRender(tmx, "CCTMXTiledMap");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                    this._callSelector(tmx, subDict);
                }
                else if (className == "CCParticleSystemQuad") {
                    if (pathExtname != ".plist") continue;

                    var particle = null;
                    if (resType == 0) {
                        particle = new cc.ParticleSystem(path);
                    }
                    else {
                        cc.log("unknown resourcetype on CCParticleSystemQuad!");
                        continue;
                    }

                    particle.setPosition(0, 0);
                    var render = new ccs.ComRender(particle, "CCParticleSystemQuad");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                    this._callSelector(particle, subDict);
                }
                else if (className == "CCArmature") {
                    if (resType != 0) {
                        continue;
                    }
                    var jsonDict = cc.loader.getRes(path);
                    if (!jsonDict) cc.log("Please load the resource [%s] first!", path);
                    var armature_data = jsonDict["armature_data"];
                    var subData = armature_data[0];
                    var name = subData["name"];

                    ccs.armatureDataManager.addArmatureFileInfo(path);

                    var armature = new ccs.Armature(name);

                    var render = new ccs.ComRender(armature, "CCArmature");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);

                    var actionName = subDict["selectedactionname"];
                    if (actionName && armature.getAnimation()) {
                        armature.getAnimation().play(actionName);
                    }
                    jsonDict = null;
                    subData = null;
                    this._callSelector(armature, subDict);
                }
                else if (className == "CCComAudio") {
                    var audio = null;
                    if (resType == 0) {
                        audio = new ccs.ComAudio();
                    }
                    else {
                        continue;
                    }
                    audio.preloadEffect(path);
                    if (comName) {
                        audio.setName(comName);
                    }
                    gb.addComponent(audio);
                    this._callSelector(audio, subDict);
                }
                else if (className == "CCComAttribute") {
                    var attribute = null;
                    if (resType == 0) {
                        attribute = new ccs.ComAttribute();
                        if (path != "") attribute.parse(path);
                    }
                    else {
                        cc.log("unknown resourcetype on CCComAttribute!");
                        continue;
                    }
                    if (comName) {
                        attribute.setName(comName);
                    }
                    gb.addComponent(attribute);
                    this._callSelector(attribute, subDict);
                }
                else if (className == "CCBackgroundAudio") {
                    if(!pathExtname) continue;
                    if(resType!=0) continue;

                    var audio  = new ccs.ComAudio();
                    audio.preloadBackgroundMusic(path);
                    audio.setFile(path);
                    var bLoop = Boolean(subDict["loop"] || 0);
                    audio.setLoop(bLoop);
                    if (comName) {
                        audio.setName(comName);
                    }
                    gb.addComponent(audio);
                    audio.playBackgroundMusic(path, bLoop);
                    this._callSelector(audio, subDict);
                }
                else if (className == "GUIComponent") {
                    var widget = ccs.uiReader.widgetFromJsonFile(path);
                    var render = new ccs.ComRender(widget, "GUIComponent");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                    this._callSelector(audio, subDict);
                }
                subDict = null;
            }
            var gameobjects = inputFiles["gameobjects"];
            for (var i = 0; i < gameobjects.length; i++) {
                var subDict = gameobjects[i];
                if (!subDict)
                    break;
                this.createObject(subDict, gb);
                subDict = null;
            }

            var canvasSizeDict = inputFiles["CanvasSize"];
            if (canvasSizeDict)
            {
                var width = canvasSizeDict["_width"];
                var height = canvasSizeDict["_height"];
                gb.setContentSize(cc.size(width, height));
            }

            return gb;
        }

        return null;
    },

    _nodeByTag: function (parent, tag) {
        if (parent == null)
            return null;
        var retNode = null;
        var children = parent.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child && child.getTag() == tag) {
                retNode = child;
                break;
            } else {
                retNode = this._nodeByTag(child, tag);
                if (retNode)
                    break;
            }
        }
        return retNode;
    },

    /**
     * Get a node by tag.
     * @param {Number} tag
     * @returns {cc.Node|null}
     */
    getNodeByTag: function (tag) {
        if (this._node == null)
            return null;
        if (this._node.getTag() == tag)
            return this._node;
        return this._nodeByTag(this._node, tag);
    },

    /**
     * Sets properties from json dictionary.
     * @param {cc.Node} node
     * @param {Object} dict
     */
    setPropertyFromJsonDict: function (node, dict) {
        var x = (cc.isUndefined(dict["x"]))?0:dict["x"];
        var y = (cc.isUndefined(dict["y"]))?0:dict["y"];
        node.setPosition(x, y);

        var bVisible = Boolean((cc.isUndefined(dict["visible"]))?1:dict["visible"]);
        node.setVisible(bVisible);

        var nTag = (cc.isUndefined(dict["objecttag"]))?-1:dict["objecttag"];
        node.setTag(nTag);

        var nZorder = (cc.isUndefined(dict["zorder"]))?0:dict["zorder"];
        node.setLocalZOrder(nZorder);

        var fScaleX = (cc.isUndefined(dict["scalex"]))?1:dict["scalex"];
        var fScaleY = (cc.isUndefined(dict["scaley"]))?1:dict["scaley"];
        node.setScaleX(fScaleX);
        node.setScaleY(fScaleY);

        var fRotationZ = (cc.isUndefined(dict["rotation"]))?0:dict["rotation"];
        node.setRotation(fRotationZ);

        var sName = dict["name"] || "";
        node.setName(sName);
    },

    /**
     * Sets the listener to reader.
     * @param {function} selector
     * @param {Object} listener the target object.
     */
    setTarget : function(selector,listener){
        this._listener = listener;
        this._selector = selector;
    },

    _callSelector:function(obj,subDict){
        if(this._selector)
            this._selector.call(this._listener,obj,subDict);
    },

    /**
     * Returns the version of ccs.SceneReader.
     * @returns {string}
     */
	version: function () {
		return "1.2.0.0";
	},

    /**
     * Clear all triggers and stops all sounds.
     */
    clear: function () {
	    ccs.triggerManager.removeAll();
	    cc.audioEngine.end();
    }
};