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

/**
 * Base class for ccs.SceneReader
 * @class
 * @extends ccs.Class
 */
ccs.SceneReader = ccs.Class.extend(/** @lends ccs.SceneReader# */{
    _baseBath:"",
    ctor: function () {
        this._instance = null;
        this._baseBath = "";
    },
    /**
     * create node with json file that exported by cocostudio scene editor
     * @param pszFileName
     * @returns {cc.Node}
     */
    createNodeWithSceneFile: function (pszFileName) {
        var data = 0;
        var node = null;
        do {
            if (!pszFileName)
                break;

            var pos = pszFileName.lastIndexOf("/");
            if(pos>-1){
                this._baseBath =pszFileName.substr(0,pos+1);
            }
            data = cc.FileUtils.getInstance().getTextFileData(pszFileName);

            if (!data)
                break;

            var jsonDict = JSON.parse(data);
            node = this.createObject(jsonDict, null);
        } while (0);
        this._baseBath = "";
        return node;
    },

    /**
     *  create object from data
     * @param {Object} inputFiles
     * @param {cc.Node} parenet
     * @returns {cc.Node}
     */
    createObject: function (inputFiles, parenet) {
        var className = inputFiles["classname"];
        if (className == "CCNode") {
            var gb = null;
            if (!parenet) {
                gb = cc.Node.create();
            }
            else {
                gb = cc.Node.create();
                parenet.addChild(gb);
            }

            this.setPropertyFromJsonDict(gb, inputFiles);

            var components = inputFiles["components"];
            for (var i = 0; i < components.length; i++) {
                var subDict = components[i];
                if (!subDict) {
                    break;
                }
                var className = subDict["classname"];
                var comName = subDict["name"];

                var fileData = subDict["fileData"];
                var path = "",fullPath = "",plistFile = "",fullPlistFile = "";
                var resType = 0;
                path +=this._baseBath;
                if (fileData != null) {
                    if(fileData.hasOwnProperty("resourceType")){
                        resType = fileData["resourceType"]
                    }else{
                        resType =-1;
                    }

                    path += fileData["path"];
                    plistFile += fileData["plistFile"];

                    fullPath = cc.FileUtils.getInstance().fullPathForFilename(path);
                    fullPlistFile = cc.FileUtils.getInstance().fullPathForFilename(plistFile);
                }

                if (className == "CCSprite") {
                    var sprite = null;

                    if (resType == 0) {
                        var startPos = path.lastIndexOf(".png");
                        if (startPos <= -1) {
                            continue;
                        }
                        sprite = cc.Sprite.create(path);
                    }
                    else if (resType == 1) {
                        var startPos = plistFile.lastIndexOf(".plist");
                        if (startPos <= -1) {
                            continue;
                        }
                        var startPos = plistFile.lastIndexOf(".", plistFile.length);
                        var pngFile = plistFile.substr(0, startPos);
                        pngFile = pngFile + ".png";

                        plistFile = this._baseBath + plistFile;
                        pngFile = this._baseBath + pngFile;
                        cc.SpriteFrameCache.getInstance().addSpriteFrames(plistFile, pngFile);
                        sprite = cc.Sprite.createWithSpriteFrameName(fileData["path"]);
                    }
                    else {
                        continue;
                    }

                    var render = ccs.ComRender.create(sprite, "CCSprite");
                    if (comName != null) {
                        render.setName(comName);
                    }

                    gb.addComponent(render);
                }
                else if (className == "CCTMXTiledMap") {
                    var tmx = null;
                    if (resType == 0) {
                        var startPos = path.lastIndexOf(".tmx");
                        if (startPos <= -1) {
                            continue;
                        }
                        tmx = cc.TMXTiledMap.create(path);
                    }
                    else {
                        continue;
                    }

                    var render = ccs.ComRender.create(tmx, "CCTMXTiledMap");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                }
                else if (className == "CCParticleSystemQuad") {
                    var startPos = path.lastIndexOf(".plist");
                    if (startPos <= -1) {
                        continue;
                    }

                    var particle = null;
                    if (resType == 0) {
                        particle = cc.ParticleSystem.create(path);
                    }
                    else {
                        cc.log("unknown resourcetype on CCParticleSystemQuad!");
                    }

                    particle.setPosition(0, 0);
                    var render = ccs.ComRender.create(particle, "CCParticleSystemQuad");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                }
                else if (className == "CCArmature") {
                    if (resType != 0) {
                        continue;
                    }
                    var reDir = path;
                    var file_path = "";
                    var pos = reDir.lastIndexOf('/');
                    if (pos != -1) {
                        file_path = reDir.substr(0, pos + 1);
                    }
                    var des = cc.FileUtils.getInstance().getTextFileData(path);
                    if (!des) {
                        cc.log("read json file[%s] error!\n", path);
                        continue;
                    }
                    var jsonDict = JSON.parse(des);
                    var armature_data = jsonDict["armature_data"];
                    var childrenCount = armature_data.length;
                    var subData = armature_data[0];
                    var name = subData["name"];

                    var config_file_path = jsonDict["config_file_path"];
                    childrenCount = config_file_path.length;
                    for (var i = 0; i < childrenCount; ++i) {
                        var plist = config_file_path[i];
                        var plistpath = "";
                        plistpath += file_path;
                        plistpath += plist;
                        var locFullPlistPath = cc.FileUtils.getInstance().fullPathForFilename(plistpath);
                        var root = cc.FileUtils.getInstance().createDictionaryWithContentsOfFile(locFullPlistPath);
                        var metadata = root["metadata"];
                        var textureFileName = metadata["textureFileName"];

                        var textupath = "";
                        textupath += file_path;
                        textupath += textureFileName;
                        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(textupath, plistpath, path);
                    }

                    var armature = ccs.Armature.create(name);
                    var render = ccs.ComRender.create(armature, "CCArmature");
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
                    des = null;
                }
                else if (className == "CCComAudio") {
                    var audio = null;
                    if (resType == 0) {
                        audio = ccs.ComAudio.create();
                    }
                    else {
                        continue;
                    }
                    audio.preloadEffect(path);
                    gb.addComponent(audio);
                }
                else if (className == "CCComAttribute") {
                    var attribute = null;
                    if (resType == 0) {
                        attribute = ccs.ComAttribute.create();
                        if(this._baseBath!=path){
                            var data = cc.FileUtils.getInstance().getTextFileData(path);
                            if (data) {
                                attribute.setDict(JSON.parse(data));
                            }
                        }
                    }
                    else {
                        cc.log("unknown resourcetype on CCComAttribute!");
                        continue;
                    }
                    gb.addComponent(attribute);
                }
                else if (className == "CCBackgroundAudio") {
                    var audio = null;
                    if (resType == 0) {
                        audio = ccs.ComAudio.create();
                    }
                    else {
                        continue;
                    }
                    audio.preloadBackgroundMusic(path);
                    audio.setFile(path);
                    var bLoop = Boolean(subDict["loop"] || 0);
                    audio.setLoop(bLoop);
                    gb.addComponent(audio);
                    audio.playBackgroundMusic(path, bLoop);
                }
                else if (className == "GUIComponent") {
                    var pLayer = ccs.UILayer.create();
                    pLayer.scheduleUpdate();
                    var widget = ccs.GUIReader.getInstance().widgetFromJsonFile(path);
                    pLayer.addWidget(widget);
                    var render = ccs.ComRender.create(pLayer, "GUIComponent");
                    if (comName != null) {
                        render.setName(comName);
                    }
                    gb.addComponent(render);
                }
                subDict = null;
            }
            var gameobjects = inputFiles["gameobjects"];
            for (var i = 0; i < gameobjects.length; i++) {
                var subDict = gameobjects[i];
                if (!subDict) {
                    break;
                }
                this.createObject(subDict, gb);
                subDict = null;
            }

            return gb;
        }

        return null;
    },

    /**
     * set property
     * @param {cc.Node} node
     * @param {Object} dict
     */
    setPropertyFromJsonDict: function (node, dict) {
        var x = dict["x"] || 0;
        var y = dict["y"] || 0;
        node.setPosition(cc.p(x, y));

        var bVisible = Boolean(dict["visible"] || 1);
        node.setVisible(bVisible);

        var nTag = dict["objecttag"] || -1;
        node.setTag(nTag);

        var nZorder = dict["zorder"] || 0;
        node.setZOrder(nZorder);

        var fScaleX = dict["scalex"] || 1;
        var fScaleY = dict["scaley"] || 1;
        node.setScaleX(fScaleX);
        node.setScaleY(fScaleY);

        var fRotationZ = dict["rotation"] || 0;
        node.setRotation(fRotationZ);
    },

    /**
     * purge instance
     */
    purge: function () {
        this._instance = null;
    }
});
ccs.SceneReader._instance = null;
/**
 * get a singleton SceneReader
 * @function
 * @return {ccs.SceneReader}
 */
ccs.SceneReader.getInstance = function () {
    if (!this._instance) {
        this._instance = new ccs.SceneReader();
    }
    return this._instance;
};
ccs.SceneReader.sceneReaderVersion = function () {
    return "1.0.0.0";
};
