ccs.GridPageView = ccs.Layout.extend({
    _pageView: null,
    _pageIndex: 2,
    _gridViews: null,
    _initPageCount: 2,
    ctor: function () {
        this._super();
        this._gridViews = [];
    },
    init: function (viewSize, cellSize, col, row, selector, target) {
        this._super();

        this.setSize(viewSize);
        this._pageView = ccs.PageView.create();
        this._pageView.setSize(viewSize);
        this.addChild(this._pageView);

        var width = cellSize.width * row;
        for (var i = 0; i < this._initPageCount; i++) {
            var _gridView = ccs.GridView.create(cellSize, col, row, selector, target);
            _gridView.setPosition(i * width, 0);
            _gridView.reloadData();

            this._pageView.addPage(_gridView);
            this._gridViews.push(_gridView);
        }
    },
    getPageViewContainer: function () {
        return this._pageView;
    },
    getPageIndexContainer: function () {
        if (!this._pageIndex) {
            this._pageIndex = ccs.UIPageIndex.create();
            this._pageIndex.setMaxPageIndexNum(5);
            this._pageIndex.setTotalPageNum(0);
            this._pageIndex.setPageNum(0);
            this._pageIndex.loadTextures(0, 0);
        }
        return this._pageIndex;
    },
    setPageIndexEnabled: function (value) {
        this._pageIndex.setVisible(value);
    }
});

ccs.GridPageView.create = function (viewSize, cellSize, col, row, selector, target) {
    var c = new ccs.GridPageView();
    c.init(viewSize, cellSize, col, row, selector, target);
    return c;
};