/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * @constant
 * @type Number
 */
cc.CCMENU_STATE_WAITING = 0;
/**
 * @constant
 * @type Number
 */
cc.CCMENU_STATE_TRACKING_TOUCH = 1;
/**
 * @constant
 * @type Number
 */
cc.CCMENU_HANDLER_PRIORITY = -128;
/**
 * @constant
 * @type Number
 */
cc.DEFAULT_PADDING = 5;

/**
 * Menu layer based on DOM html
 * @class
 * @extends cc.domNode
 */
cc.Menu = cc.domNode.extend(/** @lends cc.Menu# */{

    /**
     * init a layer with items
     * @param {Array} args array of menu items
     */
    initWithItems:function (args) {
        this.dom.id = "DomMenu" + Date.now();
        this.dom.className += " domMenu";
        this._ignoreAnchorPointForPosition = false;
        this.setContentSize(cc.Director.sharedDirector().getWinSize());
        for (var i = 0; i < args.length; i++) {
            if (args[i]) {
                //this.dom.appendChild(args[i].dom);//we dont need to append child as the child will set parent, and add to the parent
                this.addChild(args[i]);
            }
        }
    },

    /**
     * align vertically with default padding
     * @function
     */
    alignItemsVertically:function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * align vertically with specified padding
     * @param {Number} padding
     */
    alignItemsVerticallyWithPadding:function (padding) {
        var s = cc.Director.sharedDirector().getWinSize();//get window size
        var height = -padding;
        if (this.getChildren().length) {
            for (var i = 0; i < this.getChildren().length; i++) {
                var childheight = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].dom.style.fontSize,
                    this.getChildren()[i].dom.style.fontFamily).height;//loop through children, and get their individual height
                height += childheight + padding;//TODO * scale
            }
        }

        var y = height / 2.0;
        if (this.getChildren().length > 0) {
            for (i = 0; i < this.getChildren().length; i++) {
                var childheight = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].dom.style.fontSize,
                    this.getChildren()[i].dom.style.fontFamily).height;
                this.getChildren()[i].setPosition(cc.ccp(s.width / 2, s.height / 2 + y - childheight/* * this._children[i].getScaleY()*/ / 2));
                y -= childheight /** this._children[i].getScaleY()*/ + padding;
            }
        }
    },

    /**
     * align horizontally with default padding
     */
    alignItemsHorizontally:function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * align horizontally with specified padding
     * @param {Number} padding
     */
    alignItemsHorizontallyWithPadding:function (padding) {
        var s = cc.Director.sharedDirector().getWinSize();
        var width = -padding;
        if (this.getChildren().length > 0) {
            for (var i = 0; i < this.getChildren().length; i++) {
                var childwidth = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].dom.style.fontSize,
                    this.getChildren()[i].dom.style.fontFamily).width;
                width += childwidth + padding;//TODO * scale
            }
        }
        var y = width / 2.0;
        if (this.getChildren().length > 0) {
            for (i = 0; i < this.getChildren().length; i++) {
                var childwidth = cc.domNode.getTextSize(this.getChildren()[i].dom.textContent,
                    this.getChildren()[i].dom.style.fontSize,
                    this.getChildren()[i].dom.style.fontFamily).width;
                this.getChildren()[i].setPosition(cc.ccp(-y + childwidth, 0/* * this._children[i].getScaleY()*/));
                //console.log(cc.ccp(s.width / 2 + y - childwidth, -s.height / 2/* * this._children[i].getScaleY()*/));
                y -= childwidth /** this._children[i].getScaleY()*/ + padding;
            }
        }
    },

    /**
     * @function
     */
    cleanup:function () {
        this._super();
        //everytime a dom menu exits, do the clean up
        //first, kill all its children
        var mychildren = this.getChildren();
        for (var i = 0; i < mychildren.count; i++) {
            this.dom.removeChild(mychildren[i].dom);
        }
        //then kill it self, but store its parent temporarily
        var grandparent = this.dom.parentNode;
        /*        if(this.dom.parentNode)
         {
         this.dom.parentNode.removeChild(this.dom);
         }*/
        //then go up a level to the parent,(probably ccnode, if it still have some child, ignore it, other wise, go up again
        var cur = this.dom;
        var parent = cur.parentNode;
        var domlayer = cc.domNode.DomContainer();
        for (cur.parentNode.removeChild(cur); parent.childElementCount == 0;) {
            cur = parent;
            parent = cur.parentNode;
            if (cur == domlayer) {
                break;
            }
            cur.parentNode.removeChild(cur);
        }
        //repeat above step
        //kill stragglers
        var children = cc.domNode.DomContainer().childNodes;
        for (var k = 0; k < children.length; k++) {
            if (children[k].childElementCount == 0) {
                cc.domNode.DomContainer().removeChild(children[k]);
            }
        }
    }
});

/**
 * create a new dom menu
 * @return {cc.Menu}
 * @example
 * // Example
 * var myMenu = cc.Menu.create(menuitem1, menuitem2, menuitem3)//there is no limit on how many menu item you can pass in
 */
cc.Menu.create = function (/* Multiple arguments */) {
    var ret = new cc.Menu();
    ret.initWithItems(arguments);
    return ret;
};
