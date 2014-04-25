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

var plugin = plugin || {};

/**
 * @class plugin.PluginManager
 */
plugin.PluginManager = cc.Class.extend({
    _pluginsMap:null,

    ctor:function(){
        this._pluginsMap = {};
    },
    /**
     * unload the plugin by name
     * @param {String} name
     */
    unloadPlugin:function (name) {
        if (name == null || name.length == 0) return;
        if (this._pluginsMap[name]) {
            delete this._pluginsMap[name];
        }

    },

    /**
     * load the plugin by name
     * @param {String} name
     * @return {plugin.PluginProtocol||null}
     */
    loadPlugin:function (name) {
        if (name == null || name.length == 0) return null;

        var tmpPlugin;
        if (this._pluginsMap[name]) {
            tmpPlugin = this._pluginsMap[name];
        }
        else {
            tmpPlugin = plugin.PluginFactory.getInstance().createPlugin(name);
            this._pluginsMap[name] = tmpPlugin;
        }

        return tmpPlugin;
    }
});

/**
 * Get singleton of PluginManager
 * @return {plugin.PluginManager}
 */
plugin.PluginManager.getInstance = function () {
    if (!this._instance) {
        this._instance = new plugin.PluginManager();
    }
    return this._instance;
};

/**
 * Destory the instance of PluginManager
 */
plugin.PluginManager.end = function () {
    if (this._instance != null) {
        delete this._instance;
    }
};