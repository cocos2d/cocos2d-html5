/****************************************************************************
 Copyright (c) 2013 cocos2d-x.org

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

cc.ComponentContainer = cc.Class.extend({
    _components:null,
    _owner:null,

    ctor:function(node){
        this._components = null;
        this._owner = node;
    },

    getComponent:function(name){
        if(!name)
            throw "cc.ComponentContainer.getComponent(): name should be non-null";
        name = name.trim();
        return this._components[name];
    },

    add:function(component){
        if(!component)
             throw "cc.ComponentContainer.add(): component should be non-null";
        if(component.getOwner()){
            cc.log("cc.ComponentContainer.add(): Component already added. It can't be added again");
            return false;
        }

        if(this._components == null){
            this._components = {};
            this._owner.scheduleUpdate();
        }
        var oldComponent = this._components[component.getName()];
        if(oldComponent){
            cc.log("cc.ComponentContainer.add(): Component already added. It can't be added again");
            return false;
        }
        component.setOwner(this._owner);
        this._components[component.getName()] = component;
        component.onEnter();
        return true;
    },

    remove:function(name){
        if(!name)
            throw "cc.ComponentContainer.remove(): name should be non-null";
        if(!this._components)
            return false;
        var locComponents = this._components;
        name = name.trim();
        var component = locComponents[name];
        if(component)
            return false;
        component.onExit();
        component.setOwner(null);
        delete locComponents[name];
        return true;
    },

    removeAll:function(){
        if(!this._components)
            return;

        var locComponents = this._components;
        for(var selKey in locComponents){
            var selComponent = locComponents[selKey];
            selComponent.onExit();
            selComponent.setOwner(null);
            delete locComponents[selKey];
        }
        this._owner.unscheduleUpdate();
        this._components = null;
    },

    _alloc:function(){
        this._components = {};
    },

    visit:function(delta){
        if(!this._components)
            return;

        var locComponents = this._components;
        for(var selKey in locComponents){
             locComponents[selKey].update(delta);
        }
    },

    isEmpty:function(){
         if(!this._components)
            return true;

        for(var selkey in this._components){
            return false;
        }
        return true;
    }
});


