/**
 * @type {ccs.NodeRGBA.extend|*}
 */
ccs.GridViewCell = ccs.Layout.extend({
    _row: cc.INVALID_INDEX,
    _idx: cc.INVALID_INDEX,
    getIdx: function () {
        return this._idx;
    },
    setIdx: function (idx) {
        this._idx = idx;
    },
    getRow: function () {
        return this._row;
    },
    setRow: function (row) {
        this._row = row;
    },
    reset: function () {
        this._idx = cc.INVALID_INDEX;
    }
});

/**
 * @type {ccs.NodeRGBA.extend|*}
 */
ccs.GridView = ccs.ScrollView.extend({
    _cellsSize: null,
    _cellsCount: 0,
    _columns: 0,
    _rows: 0,

    _indices: null,
    _cellsRow: null,
    _cellsUsed: null,
    _cellsFreed: null,
    _positions: null,

    _dataSourceAdapterListener: null,
    _dataSourceAdapterHandler: null,

    _RELOCATE_SPPED: 350,
    init: function (viewSize, cellSize, cellCount, target, selector) {
        this._super();

        this._cellsSize = cc.size(0, 0);
        this._indices = {};
        this._cellsUsed = [];
        this._cellsFreed = [];
        this._positions = [];

        this.setSize(viewSize);
        this.setSizeOfCell(cellSize);
        this.setCountOfCell(cellCount);
        this.setDataSourceAdapter(target, selector);
    },

    setDataSourceAdapter: function (target, selector) {
        this._dataSourceAdapterListener = target;
        this._dataSourceAdapterHandler = selector;
    },

    executeDataSourceAdapterHandler: function (convertCell, idx) {
        if (this._dataSourceAdapterListener && this._dataSourceAdapterHandler) {
            return this._dataSourceAdapterHandler.call(this._dataSourceAdapterListener, convertCell, idx);
        }
    },

    setCountOfCell: function (cellsCount) {
        this._cellsCount = cellsCount;
    },

    getCountOfCell: function () {
        return this._cellsCount;
    },

    setSizeOfCell: function (cellsSize) {
        this._cellsSize = cellsSize;
    },

    getSizeOfCell: function () {
        return this._cellsSize;
    },

    setColumns: function (columns) {
        this._columns = columns;
    },

    getColumns: function () {
        return this._columns;
    },

    getRows: function () {
        return this._rows;
    },

    getCells: function () {
        var arr = [];
        for (var i = 0; i < this._cellsUsed.length; i++) {
            arr.push(this._cellsUsed[i]);
        }
        return arr;
    },

    cellAtIndex: function (idx) {
        var obj;
        for (var i = 0; i < this._cellsUsed.length; i++) {
            obj = this._cellsUsed[i];
            if (obj.getIdx() == idx) {
                return obj;
            }
        }
    },

    dequeueCell: function () {
        return this._cellsFreed.shift();
    },

    reloadData: function () {
        cc.Assert(this._cellsSize.width != 0 && this._cellsSize.height != 0, "reloadData");
        cc.Assert(this._columns != 0, "reloadData");

        for (var i = 0; i < this._cellsUsed.length; i++) {
            var obj = this._cellsUsed.pop();
            obj.reset();
            this._cellsFreed.push(obj);
            this.removeChild(obj, true);
        }

        this._indices = {};
        this._positions.length = 0;
        this.updatePositions();
        this.jumpToTop();
        this.onScrolling();
        this.addEventListenerScrollView(this.onScrolling, this);

//        this.relocateContainer();

        window.test = this;
    },

    onScrolling: function () {
        //getContentOffset
        var offset = this.getInnerContainer().getPosition();
        var beginRow = this.cellBeginRowFromOffset(offset),
            endRow = this.cellEndRowFromOffset(offset),
            beginColumn = this.cellBeginColumnFromOffset(offset),
            endColumn = this.cellEndColumnFromOffset(offset);

        var cellsUsed = this._cellsUsed;
        if (cellsUsed.length > 0) {
            var cell, row,column, idx;
            for (var i = 0; i < cellsUsed.length; i++) {
                cell = cellsUsed[i], row = cell.getRow(), idx = cell.getIdx(), column = (row == 0) ? 0 : idx % row;

                if (row < beginRow || (row > endRow && row < this._rows) || column < beginColumn || (column > endColumn && column < this._columns)) {
                    //console.log(1)
                    cell.reset();
                    this.removeChild(cell, true);
                    cellsUsed.splice(i,1);
                    this._indices[idx] = false;
                    this._cellsFreed.push(cell);
                }
            }
        }

        for (var i = beginRow; i <= endRow && i < this._rows; ++i) {
            var cellBeginIndex = this.cellFirstIndexFromRow(i),
                cellEndIndex = cellBeginIndex + this._columns;

            for (var idx = cellBeginIndex; idx < cellEndIndex && idx < this._cellsCount; ++idx) {
                if (!this._indices[idx]) {
                    this.updateCellAtIndex(idx, i);
                }
            }
        }
    },

    removeAllFromUsed: function () {
        if (this._cellsUsed.length != 0) {
            this._cellsUsed.length = 0;
            this._indices = {};
        }
    },

    removeAllFromFreed: function () {
        if (this._cellsFreed.length != 0) {
            this._cellsFreed.length = 0;
            this._indices = {};
        }
    },

    insertSortableCell: function (cell, idx) {
        if (this._cellsUsed.length == 0) {
            this._cellsUsed.push(cell);
        }
        else {
            var obj;
            for (var i = 0; i < this._cellsUsed.length; i++) {
                obj = this._cellsUsed[i];
                if (obj.getIdx() > idx) {
                    this._cellsUsed.splice(i, 0, cell);
                    return;
                }
            }
            this._cellsUsed.push(cell);
        }
    },

    updatePositions: function () {
        if (this._cellsCount == 0)
            return;

        this._rows = Math.ceil(this._cellsCount / this._columns);
        var width = Math.max(this._columns * this._cellsSize.width, this.getContentSize().width),
            height = Math.max(this._rows * this._cellsSize.height, this.getContentSize().height);
        this.setInnerContainerSize(cc.size(width, height));

        var x = 0,y = height;
        for (var i = 0; i < this._cellsCount; ++i) {
            if (i != 0 && i % this._columns == 0) {
                x = 0;
                y = y - this._cellsSize.height;
            }
            this._positions.push(cc.p(x, y));
            x += this._cellsSize.width;
        }
    },

    updateCellAtIndex: function (idx, row) {
        if (this._cellsCount == 0)
            return;

        var cell = this.executeDataSourceAdapterHandler(this.dequeueCell(), idx);
        cell.setIdx(idx);
        cell.setRow(row);
        cell.setContentSize(this._cellsSize);
        cell.setAnchorPoint(cc.p(0, 1));
        cell.setPosition(this.cellPositionFromIndex(idx));
        this.addChild(cell);
        this.insertSortableCell(cell, idx);
        this._indices[idx] = true;
    },

    cellPositionFromIndex: function (idx) {
        if(idx == cc.INVALID_INDEX){
            idx = 0;
        }
        return this._positions[idx];
    },

    cellBeginRowFromOffset: function (offset) {
        var ofy = offset.y + this.getInnerContainerSize().height,
            xos = ofy - this.getContentSize().height,
            row = 0 | (xos / this._cellsSize.height);

        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    cellEndRowFromOffset: function (offset) {
        var ofy = offset.y + this.getInnerContainerSize().height,
            row = 0 | (ofy / this._cellsSize.height);
        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    cellBeginColumnFromOffset: function (offset) {
        var column = 0 | (offset.x / this._cellsSize.width);
        return Math.abs(column);
    },

    cellEndColumnFromOffset: function (offset) {
        var ofx = Math.abs(offset.x) + this.getContentSize().width,
            column = 0 | (ofx / this._cellsSize.width);
        return column;
    },

    cellFirstIndexFromRow: function (row) {
        return this._columns * row;
    }
});

ccs.GridView.create = function (viewSize, cellSize, cellCount, target, selector) {
    var view = new ccs.GridView();
    view.init(viewSize, cellSize, cellCount, target, selector);
    return view;
};