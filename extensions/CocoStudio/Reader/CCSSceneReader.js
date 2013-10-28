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

cc.CCSSceneReader = cc.Class.extend({
    _baseBath:"",
    ctor: function () {
        this._instance = null;
        this._baseBath = "";
    },
    createNodeWithSceneFile: function (pszFileName) {
        var size = 0;
        var data = 0;
        var node = null;
        do {
            if (!pszFileName)
                break;

            var strFileName = pszFileName;
            var pos = strFileName.lastIndexOf("/");
            if(pos>-1){
                this._baseBath =strFileName.substr(0,pos+1);
            }
            data = cc.FileUtils.getInstance().getTextFileData(pszFileName, "r", size);

            if (!data)
                break;

            var jsonDict = JSON.parse(data);
            node = this.createObject(jsonDict, null);
        } while (0);
        this._baseBath = "";
        return node;
    },

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
                var path = "";
                var plistFile = "";
                var resType = 0;
                path +=this._baseBath;
                if (fileData != null) {
                    var file = fileData["path"];
                    resType = fileData["resourceType"]
                    resType = (resType || resType == 0) ? resType : -1;
                    var plistFile = fileData["plistFile"];
                    if (file != null) {
                        path += cc.FileUtils.getInstance().fullPathForFilename(file);
                    }

                    if (plistFile != null) {
                        plistFile += cc.FileUtils.getInstance().fullPathForFilename(plistFile);
                    }
                    fileData = null;
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

                        pngFile.replace(pos, pngFile.length(), ".png");
                        cc.SpriteFrameCache.getInstance().addSpriteFrames(plistFile, pngFile);
                        sprite = cc.Sprite.createWithSpriteFrameName(path);
                    }
                    else {
                        continue;
                    }

                    var render = cc.ComRender.create(sprite, "CCSprite");
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

                    var render = cc.ComRender.create(tmx, "CCTMXTiledMap");
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
                    var render = cc.ComRender.create(particle, "CCParticleSystemQuad");
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
                    var size = 0;
                    var des = cc.FileUtils.getInstance().getTextFileData(path, "r", size);
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
                        var root = cc.FileUtils.getInstance().createDictionaryWithContentsOfFile(plistpath);
                        var metadata = root["metadata"];
                        var textureFileName = metadata["textureFileName"];

                        var textupath = "";
                        textupath += file_path;
                        textupath += textureFileName;
                        cc.ArmatureDataManager.getInstance().addArmatureFileInfo(textupath, plistpath, path);
                    }

                    var armature = cc.Armature.create(name);
                    var render = cc.ComRender.create(armature, "CCArmature");
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
                        audio = cc.ComAudio.create();
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
                        attribute = cc.ComAttribute.create();
                        var size = 0;
                        var data = 0;
                        data = cc.FileUtils.getInstance().getTextFileData(path, "r", size);
                        if (data) {
                            attribute.setDict(JSON.parse(data));
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
                        audio = cc.ComAudio.create();
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
                    var pLayer = cc.UILayer.create();
                    pLayer.scheduleUpdate();
                    var widget = cc.UIHelper.getInstance().createWidgetFromJsonFile(path);
                    pLayer.addWidget(widget);
                    var render = cc.ComRender.create(pLayer, "GUIComponent");
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

    purgeSceneReader: function () {
        this._instance = null;
    }
});
cc.CCSSceneReader._instance = null;
cc.CCSSceneReader.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.CCSSceneReader();
    }
    return this._instance;
};
cc.CCSSceneReader.sceneReaderVersion = function () {
    return "1.0.0.0";
};
