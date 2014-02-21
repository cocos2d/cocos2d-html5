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

var MyLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init:function () {

        //////////////////////////////
        // 1. super init first
        this._super();
 

        var pBg = cc.Sprite.create("HelloWorld.jpg");
        pBg.setPosition(cc.p(240, 160));
        this.addChild(pBg);

        var gridView = ccs.GridView.create(
            cc.size(240, 160),
            cc.size(240 / 10, 160 / 10),
            100, this,this.gridviewDataSource);
        gridView.setTouchEnabled(true);
        gridView.setDirection(ccs.ScrollViewDir.vertical);
        gridView.setSize(cc.size(240, 160));
        gridView.setBackGroundColorType(ccs.LayoutBackGroundColorType.solid);
        gridView.setBackGroundColor(cc.c3b(111,111,111));
        gridView.setColumns(6);
        gridView.reloadData();

        var uiLayer = ccs.UILayer.create();
        uiLayer.setPosition(cc.p(100,100));
        uiLayer.addWidget(gridView);
        this.addChild(uiLayer);
    },
    gridviewDataSource:function(convertView, idx){
        var cell = convertView;
        var pButton;

        if(!cell){
            cell = new ccs.GridViewCell();
            pButton = cc.LabelTTF.create("0", "Arial", 12);
            pButton.setAnchorPoint(0,0);
            pButton.setTag(1);
            cell.addNode(pButton);
        }
        else{
            pButton = cell.getChildByTag(1);
        }

        pButton.setString(idx);
        return cell;
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
