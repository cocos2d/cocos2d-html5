/**
 * Created by lihex on 14-2-15.
 */

/**
 * 页码指示器
 * @type {Function|*}
 */
ccs.PageIndex = ccs.Layout.extend(/** @lends ccs.UILayer# */{
    _totalPageNum: 1,
    _lastPageNum: 1,
    _curPageNum: 1,
    _lastPageIndex: 0,
    _curPageIndex: 0,
    _requiredPageIndexNum : 1,
    _maxPageIndexNum: 5,
    _pageIndexRenders: null,
    _pageOnRender: null,
    _offTexName: "",
    _offTexType: 0,
    _onTexName: "",
    _onTexType: 0,
    _spacing: 8,
    _indexDirty: false,

    init: function () {
        this._super();
        this._pageIndexRenders = [];
        this._pageOnRender = ccs.ImageView.create();
        this._pageIndexRenders.push(this._pageOnRender);
    },

    /**
     * 加载图标
     * @param on
     * @param off
     * @param texType
     */
    loadTextures: function(on, off, texType){
        this.loadOnTexture(on, texType);
        this.loadOffTexture(off, texType);
    },

    /**
     *  加载灰色图标
     * @param off 资源名
     * @param texType 加载类型
     */
    loadOffTexture: function(off, texType){
        if (!off) {
            return;
        }
        texType = texType||ccs.TextureResType.local;
        this._offTexName = off;
        this._offTexType = texType;

        var indexRenders = this._pageIndexRenders;
        for(var i = 1, li = indexRenders.length; i < li; i++){
            indexRenders[i].loadTexture(off, this._offTexType);
        }
    },

    /**
     * 加载高亮图标
     * @param off 资源名
     * @param texType 加载类型
     */
    loadOnTexture: function(on, texType){
        if (!on) {
            return;
        }
        texType = texType||ccs.TextureResType.local;
        this._onTexName = on;
        this._onTexType = texType;
        this._pageOnRender.loadTexture(on, this._offTexType);
    },

    /**
     *  设置图标间距
     * @param spacing
     */
    setSpacing: function(spacing){
        this._spacing = spacing;
        this._indexDirty = true;
    },

    drawPageIndexIcon: function(){
        var items = this._pageIndexRenders;
        var spacing = this._spacing;
        var iconSize = this._pageOnRender.getContentSize();

        if(!items)
            return;

        var itemLength = this._requiredPageIndexNum;
        var halfIconSize = cc.size(iconSize.width * 0.5, iconSize.height * 0.5);
        var pageIndexPos = cc.p(0,0);
        var starPosition = (cc.pAdd(
            pageIndexPos,
            cc.p(
                -(Math.floor(itemLength * 0.5))*(halfIconSize.width + spacing + halfIconSize.width),
                0
            )
        ));

        var index, r, c;
        for(index = 0; index < itemLength; index++){
            r = 1;
            c = index;
            var indexIcon = items[index];
            indexIcon.setPosition(
                cc.pAdd(
                    starPosition,
                    cc.p(
                        c*(halfIconSize.width + spacing + halfIconSize.width),
                        0
                    )
                ));
            this.addChild(indexIcon);
        }
    },

    /**
     *  设置最多显示图标数
     * @param num
     */
    setMaxPageIndexNum: function(num){
        if(num < 1){
            this._maxPageIndexNum = 1;
        }
        this._maxPageIndexNum = num;

        this._indexDirty = true;
    },

    /**
     *  设置总页数
     * @param num
     */
    setTotalPageNum: function(num){
        this._totalPageNum = num;
        this._requiredPageIndexNum = num;
        if(num < 1){
            this._totalPageNum = 1;
            this._requiredPageIndexNum = 1;
        }
        if(num > this._maxPageIndexNum){
            this._requiredPageIndexNum = this._maxPageIndexNum;
        }
        var curLength = this._pageIndexRenders.length;

        // 如果不够则添加
        var delta = 0;
        if( curLength < this._requiredPageIndexNum){
            delta = this._requiredPageIndexNum - curLength;
        }
        var render;
        for(var i = 0; i < delta; i++){
            render = ccs.ImageView.create();
            render.loadTexture(this._offTexName, this._offTexType);
            this._pageIndexRenders.push(render);
        }
        this.setPageNum(1);

        this._indexDirty = true;
    },

    /**
     *  设置页码
     * @param num 从1开始
     */
    setPageNum: function(num){
        this._curPageNum = num;
        if(num < 1){
            this._curPageNum = 1;
        }
        if(num > this._totalPageNum){
            this._curPageNum = this._totalPageNum;
        }

        var index, requiredPageIndexNum;
        requiredPageIndexNum = this._requiredPageIndexNum;
        if(this._curPageNum !== this._lastPageNum){
            index = Math.round( requiredPageIndexNum * (this._curPageNum / this._totalPageNum));
            this._setPageIndex(index -1);
            this._lastPageNum = this._curPageNum;
        }
    },

    /**
     *  设置页码索引
     * @param index 从0开始
     */
    _setPageIndex: function(index){
        this._curPageIndex = parseInt(index);
        if(index < 0){
            this._curPageIndex = 0;
        }
        if(index >= this._requiredPageIndexNum){
            this._curPageIndex = this._requiredPageIndexNum -1;
        }
        if(this._curPageIndex !== this._lastPageIndex){
            this._updateIndex();
        }
    },

    /**
     *  更新图标位置
     * @private
     */
    _updateIndex: function(){
        var self = this;
        var prePageIndex = this._lastPageIndex;
        var curPageIndex = this._curPageIndex;
        // 交换图标位置
        var preIcon = self._pageIndexRenders[prePageIndex];
        var curIcon = self._pageIndexRenders[curPageIndex];
        var tmpPos = cc.p(preIcon.getPosition().x, preIcon.getPosition().y);
        preIcon.setPosition(curIcon.getPosition().x, curIcon.getPosition().y);
        curIcon.setPosition(tmpPos);
        // 交换数据
        ccs.arraySwap(self._pageIndexRenders, prePageIndex, curPageIndex);
        this._lastPageIndex = this._curPageIndex;
    },
    visit:function(ctx){
        this._super(ctx);
        if(this._indexDirty){
            this._indexDirty = false;
            this.removeAllChildren();
            this.drawPageIndexIcon();
        }
    }
});

ccs.PageIndex.create = function(){
    var c = new ccs.PageIndex();
    c.init();
    return c;
};

ccs.arraySwap = function(arr, oldIndex, newIndex) {
    arr[oldIndex] = arr.splice(newIndex, 1, arr[oldIndex])[0];
    return arr;
};
