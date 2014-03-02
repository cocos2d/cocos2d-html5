/**
 * Grid page view
 */
ccs.GridPageView = ccs.Layout.extend({
    _rows: 0,
    _columns: 0,
    _pageViewContainer: null,
    _pageIndexContainer: null,
    _totalCellsCount: 0,
    _useGridViews: null,
    _freeGridViews: null,
    _curGridView: null,
    _initPageCount: 3,
    _cellsCounts: 0,
    _widthPerPage: 0,
    _lastedPageNum: 0,
    _pageIndexDistance: 20,

    ctor: function () {
        this._super();
        this._useGridViews = [];
        this._freeGridViews = [];
    },

    init: function (viewSize, cellSize, col, row, totalCellsCount, selector, target) {
        this._super();
        this.setSize(viewSize);

        this._rows = col;
        this._columns = row;
        this._totalPageCount = Math.ceil(totalCellsCount / (col * row));

        this._pageViewContainer = ccs.PageView.create();
        this._pageViewContainer.setSize(viewSize);
        this._pageViewContainer.addEventListenerPageView(this._pageViewEvent, this);
        this.addChild(this._pageViewContainer);

        var _gridView, width = viewSize.width;
        for (var i = 0; i < this._totalPageCount; i++) {
            var layout = this._pageViewContainer.createPage();
            layout.setPosition(width * i, 0);
            if (i < this._initPageCount) {
                _gridView = ccs.GridView.create(cellSize, col, row, selector, target);
                _gridView.setCurPage(i);
                _gridView.reloadData();
                _gridView.setTag(9);
                layout.addChild(_gridView);
                this._useGridViews.push(_gridView);
            }
            this._pageViewContainer.addPage(layout);
        }
    },

    _pageViewEvent: function () {
        var _pageViewContainer = this.getPageViewContainer(), pages = _pageViewContainer.getPages();
        var curPageIndex = _pageViewContainer.getCurPageIndex(), prePage, nextPage,
            totalPageCount = this._totalPageCount;

        var page, _gridView;
        for (var i = 0; i < pages.length; i++) {
            page = pages[i];
            if (i < curPageIndex - 1 || i > curPageIndex + 1) {
                page.setVisible(false);
                _gridView = page.getChildByTag(9);
                this._reclaimGridView(_gridView);
            }
            else {
                page.setVisible(true);
            }
        }

        prePage = curPageIndex !== 0 ? pages[curPageIndex - 1] : null;
        nextPage = curPageIndex !== totalPageCount ? pages[curPageIndex + 1] : null;

        if (this._lastedPageNum < curPageIndex && nextPage) {
            _gridView = this._dequeueGridView();
            if (_gridView) {
                _gridView.setCurPage(curPageIndex + 1);
                _gridView.reloadData();
                nextPage.addChild(_gridView);
                this._useGridViews.push(_gridView);
            }
        }
        else if (this._lastedPageNum > curPageIndex && prePage) {
            _gridView = this._dequeueGridView();
            if (_gridView) {
                _gridView.setCurPage(curPageIndex - 1);
                _gridView.reloadData();
                prePage.addChild(_gridView);
                this._useGridViews.push(_gridView);
            }
        }

        this._pageIndexContainer.setPageNum(curPageIndex + 1);
        this._lastedPageNum = curPageIndex;
    },

    _reclaimGridView: function (gridView) {
        if (gridView) {
            gridView.removeFromParent(true);
            this._freeGridViews.push(gridView);
        }
    },

    _dequeueGridView: function () {
        return this._freeGridViews.pop();
    },

    /**
     * 获取pageViewContainer
     * @returns {ccs.PageView}
     */
    getPageViewContainer: function () {
        return this._pageViewContainer;
    },

    /**
     * 获取pageIndex
     * @returns {ccs.PageIndex}
     */
    getPageIndexContainer: function () {
        if (!this._pageIndexContainer) {
            var size = this._pageViewContainer.getSize();
            this._pageIndexContainer = ccs.PageIndex.create();
            this._pageIndexContainer.setMaxPageIndexNum(10);
            this._pageIndexContainer.setTotalPageNum(this._totalPageCount);
            this._pageIndexContainer.loadTextures(s_CloseNormal, s_CloseSelected);
            this._pageIndexContainer.setPosition(size.width / 2, -this._pageIndexDistance);
        }
        return this._pageIndexContainer;
    },

    /**
     * 启动pageIndex
     * @param {Boolean} value
     */
    setPageIndexEnabled: function (value) {
        if (value) {
            var pageIndex = this.getPageIndexContainer();
            this.addChild(pageIndex);
        }
        else {
            if (this._pageIndexContainer) {
                this._pageIndexContainer.removeFromParent(true);
            }
        }
    },

    /**
     * 设置pageIndex和pageView的距离
     * @param {Number} distance
     */
    setPageIndexDistance: function (distance) {
        this._pageIndexDistance = distance;
        this._pageIndexContainer.setPositionY(-this._pageIndexDistance);
    },

    /**
     * 获取pageIndex和pageView的距离
     * @returns {number}
     */
    getPageIndexDistance: function () {
        return this._pageIndexDistance;
    }
});


/**
 * @param viewSize 视窗尺寸
 * @param cellSize 格子尺寸
 * @param col 单页的列数
 * @param row 单页的横数
 * @param totalCellsCount 所有格子的数量
 * @param selector
 * @param target
 * @returns {ccs.GridPageView}
 *
 * @example
 *
 *     var gridPageView = ccs.GridPageView.create(
 *              cc.size(240,160),cc.size(24,16),
 *              10, 5,this._data.length, this.gridviewDataSource, this);
 *      gridPageView.setPageIndexEnabled(true);
 *      uiLayer.addWidget(gridPageView);
 *
 *
 *      gridviewDataSource:function(convertView, idx){
 *          var cell = convertView;
 *          var button;
 *
 *          if(!cell){
 *              var str = this._data[idx];
 *
 *              cell = new ccs.GridViewCell();
 *              button = cc.LabelTTF.create(str, "Arial", 12);
 *              button.setAnchorPoint(0,0);
 *              button.setTag(1);
 *              cell.addNode(button);
 *          }
 *          else{
 *              button = cell.getChildByTag(1);
 *          }
 *
 *          button.setString(idx);
 *          return cell;
 *      }
 */
ccs.GridPageView.create = function (viewSize, cellSize, col, row, totalCellsCount, selector, target) {
    var c = new ccs.GridPageView();
    c.init(viewSize, cellSize, col, row, totalCellsCount, selector, target);
    return c;
};