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
ccs.GridView = ccs.Layout.extend({
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
    init: function (cellSize, col, row, selector, target) {
        this._super();

        this._cellsSize = cc.size(0, 0);
        this._indices = {};
        this._cellsUsed = [];
        this._cellsFreed = [];
        this._positions = [];

        this.setColumns(col);
        this.setRows(row);
        this.setSizeOfCell(cellSize);
        this.setCountOfCell(row * col);

        this.addEventListenerGridView(selector, target);
    },

    addEventListenerGridView: function (selector, target) {
        this._dataSourceAdapterHandler = selector;
        this._dataSourceAdapterListener = target;
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

    setRows: function (rows) {
        this._rows = rows;
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

        this.removeAllFromUsed();
        this._indices = {};
        this._positions.length = 0;
        this.updatePositions();
        this.updateData();
    },

    updateData: function (offset, target) {
        var beginRow = !offset ? 0 : this.cellBeginRowFromOffset(offset, target),
            endRow = !offset? this._rows : this.cellEndRowFromOffset(offset, target);

        for (var i = beginRow; i <= endRow && i < this._rows; ++i) {
            var cellBeginIndex = this.cellFirstIndexFromRow(i),
                cellEndIndex = cellBeginIndex + this._columns;

            console.log(cellBeginIndex, cellEndIndex,this._columns)

            for (var idx = cellBeginIndex; idx < cellEndIndex && idx < this._cellsCount; ++idx) {
                if (!this._indices[idx]) {
                    this.updateCellAtIndex(idx, i);
                }
            }
        }
    },

    removeAllFromUsed: function () {
        if (this._cellsUsed.length != 0) {
            for (var i = 0; i < this._cellsUsed.length; i++) {
                var obj = this._cellsUsed.pop();
                obj.reset();
                this._cellsFreed.push(obj);
                this.removeChild(obj, true);
            }
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
            var obj, i;
            for (i = 0; i < this._cellsUsed.length; i++) {
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

        var width = this._columns * this._cellsSize.width,
            height = this._rows * this._cellsSize.height;
        this.setSize(cc.size(width, height));
//        this.setContentSize(cc.size(width, height));

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

    cellBeginRowFromOffset: function (offset, target) {
        var ofy = offset.y + target.getInnerContainerSize().height,
            xos = ofy - target.getContentSize().height,
            row = 0 | (xos / this._cellsSize.height);

        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    cellEndRowFromOffset: function (offset,target) {
        var ofy = offset.y + target.getInnerContainerSize().height,
            row = 0 | (ofy / this._cellsSize.height);
        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    cellBeginColumnFromOffset: function (offset,target) {
        var column = 0 | (offset.x / this._cellsSize.width);
        return Math.abs(column);
    },

    cellEndColumnFromOffset: function (offset,target) {
        var ofx = Math.abs(offset.x) + target.getContentSize().width,
            column = 0 | (ofx / this._cellsSize.width);
        return column;
    },

    cellFirstIndexFromRow: function (row) {
        return this._columns * row;
    }
});

ccs.GridView.create = function (cellSize, col, row, selector, target) {
    var view = new ccs.GridView();
    view.init(cellSize, col, row, selector, target);
    return view;
};