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
        if (this._pluginsMap.hasOwnProperty(name)) {
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
        if (this._pluginsMap.hasOwnProperty(name)) {
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