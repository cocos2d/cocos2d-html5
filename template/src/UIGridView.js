/**
 * 网格cell
 */
ccs.GridViewCell = ccs.Widget.extend({
    _row: cc.INVALID_INDEX,
    _idx: cc.INVALID_INDEX,

    /**
     * 获取cell的index
     * @returns {number}
     */
    getIdx: function () {
        return this._idx;
    },

    /**
     * 设置cell的index
     * @param {number} idx
     */
    setIdx: function (idx) {
        this._idx = idx;
    },

    /**
     * 获取cell所在的列数
     * @returns {number}
     */
    getRow: function () {
        return this._row;
    },

    /**
     * 设置cell所在的列数
     * @param {number} row
     */
    setRow: function (row) {
        this._row = row;
    },

    /**
     * 重置这个cell
     */
    reset: function () {
        this._idx = cc.INVALID_INDEX;
        this._row = cc.INVALID_INDEX;
    }
});

/**
 * 网格
 */
ccs.GridView = ccs.Layout.extend({
    _cellsSize: null,
    _cellsCountPerPage: 0,
    _curPageNum: 0,
    _columns: 0,
    _rows: 0,

    _indices: null,
    _cellsUsed: null,
    _cellsFreed: null,
    _positions: null,

    _dataSourceAdapterSelector: null,
    _dataSourceAdapterTarget: null,

    ctor:function(){
        this._super();
        this._indices = {};
        this._cellsUsed = [];
        this._cellsFreed = [];
        this._positions = [];
    },

    init: function (cellSize, col, row, selector, target) {
        this._super();

        this._columns = col;
        this._rows = row;
        this._cellsSize = cellSize;
        this._cellsCountPerPage = row * col;
        this.addEventListenerGridView(selector, target);
        this._resetSize();
    },

    _resetSize:function(){
        var width = this._columns * this._cellsSize.width,
            height = this._rows * this._cellsSize.height;
        this.setSize(cc.size(width, height));
    },

    /**
     * 设置绑定数据的callback
     * @param selector
     * @param target
     */
    addEventListenerGridView: function (selector, target) {
        this._dataSourceAdapterTarget = selector;
        this._dataSourceAdapterSelector = target;
    },

    _executeDataAdapterCallback: function (convertCell, idx) {
        if (this._dataSourceAdapterSelector && this._dataSourceAdapterTarget) {
            return this._dataSourceAdapterTarget.call(this._dataSourceAdapterSelector, convertCell, idx);
        }
    },

    /**
     * 设置cell的数量
     * @param {Number} cellsCountPerPage
     */
    setCountOfCell: function (cellsCountPerPage) {
        this._cellsCountPerPage = cellsCountPerPage;
    },

    /**
     * 获取cell的数量
     * @returns {number}
     */
    getCountOfCell: function () {
        return this._cellsCountPerPage;
    },

    /**
     * 设置cell的尺寸
     * @param {cc.Size} cellsSize
     */
    setSizeOfCell: function (cellsSize) {
        this._cellsSize = cellsSize;
        this._resetSize();
    },

    /**
     * 获取cell的尺寸
     * @returns {null}
     */
    getSizeOfCell: function () {
        return this._cellsSize;
    },

    /**
     * 设置列数
     * @param {Number} columns
     */
    setColumns: function (columns) {
        this._columns = columns;
        this._resetSize();
    },

    /**
     * 获取列数
     * @returns {number}
     */
    getColumns: function () {
        return this._columns;
    },

    /**
     * 设置行数
     * @param {Number} rows
     */
    setRows: function (rows) {
        this._rows = rows;
        this._resetSize();
    },

    /**
     * 获取行数
     * @returns {number}
     */
    getRows: function () {
        return this._rows;
    },

    /**
     * 设置当前是位于第几页（用于GridPageView里）
     * @param {Number} num
     */
    setCurPage:function(num){
        this._curPageNum = num;
    },

    /**
     * 获取当前是位于第几页
     * @returns {number}
     */
    getCurPage:function(){
        return this._curPageNum;
    },

    /**
     * 获取所有的cell
     * @returns {Array}
     */
    getCells: function () {
        var arr = [];
        for (var i = 0; i < this._cellsUsed.length; i++) {
            arr.push(this._cellsUsed[i]);
        }
        return arr;
    },

    /**
     * 通过index获取一个cell
     * @param {Number} idx
     * @returns {*}
     */
    cellAtIndex: function (idx) {
        var obj;
        for (var i = 0; i < this._cellsUsed.length; i++) {
            obj = this._cellsUsed[i];
            if (obj.getIdx() == idx) {
                return obj;
            }
        }
    },

    _dequeueCell: function () {
        return this._cellsFreed.shift();
    },

    /**
     * 加载数据
     */
    reloadData: function () {
        cc.Assert(this._cellsSize.width != 0 && this._cellsSize.height != 0, "_cellsSize width and height could not be 0");
        cc.Assert(this._columns != 0 || this._rows != 0, "_columns or _rows could not be 0");

        this._indices = {};
        this._positions.length = 0;

        this.removeAllFromUsed();
        this.updatePositions();
        this._updateData();
    },

    _updateData: function (offset, target,innerHeight) {
        var beginRow = !offset ? 0 : this._cellBeginRowFromOffset(offset, target,innerHeight),
            endRow = !offset? this._rows : this._cellEndRowFromOffset(offset, target,innerHeight),
            beginColumn = !offset ? 0 : this._cellBeginColumnFromOffset(offset, target),
            endColumn = !offset? this._columns :this._cellEndColumnFromOffset(offset, target);
        console.log(beginRow,endRow,beginColumn,endColumn)
        var cellsUsed = this._cellsUsed;
        if (cellsUsed.length > 0) {
            var cell, row,column, idx;
            for (var i = 0; i < cellsUsed.length; i++) {
                cell = cellsUsed[i], row = cell.getRow(), idx = cell.getIdx(),
                    column = idx % this._columns;

                if (row < beginRow || (row > endRow && row < this._rows)||
                    column < beginColumn || (column > endColumn && column < this._columns)) {
                    cell.reset();
                    cell.removeFromParent(true);
                    cellsUsed.splice(i,1);
                    this._indices[idx] = false;
                    this._cellsFreed.push(cell);
                }
            }
        }

        for (var i = beginRow; i <= endRow && i < this._rows; ++i) {
            var cellRowIndex = this._cellFirstIndexFromRow(i),
                cellBeginIndex = cellRowIndex + beginColumn,
                cellEndIndex = cellRowIndex +  endColumn;

            for (var idx = cellBeginIndex; idx < cellEndIndex/* && idx < this._cellsCountPerPage*/; ++idx) {
                if (!this._indices[idx]) {
                    this.updateCellAtIndex(idx, i);
                }
            }
        }
    },

    /**
     * 移除所有在使用的cell
     */
    removeAllFromUsed: function () {
        if (this._cellsUsed.length != 0) {
            var len = this._cellsUsed.length;
            for (var i = 0; i < len; i++) {
                var obj = this._cellsUsed.pop();
                obj.reset();
                this._cellsFreed.push(obj);
                this.removeChild(obj, true);
            }
            this._indices = {};
        }
    },

    /**
     * 移动所有没用的cell
     */
    removeAllFromFreed: function () {
        if (this._cellsFreed.length != 0) {
            this._cellsFreed.length = 0;
            this._indices = {};
        }
    },

    /**
     * 某个位置插入一个cell
     * @param {Object} cell
     * @param {Number} idx
     */
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

    /**
     * 更新cell的位置
     */
    updatePositions: function () {
        if (this._cellsCountPerPage == 0)
            return;

        var x = 0,y = this.getSize().height;
        for (var i = 0; i < this._cellsCountPerPage; ++i) {
            if (i != 0 && i % this._columns == 0) {
                x = 0;
                y = y - this._cellsSize.height;
            }
            this._positions.push(cc.p(x, y));
            x += this._cellsSize.width;
        }
    },

    /**
     * 更新某个位置的cell
     * @param {Number} idx
     * @param {Number} row
     */
    updateCellAtIndex: function (idx, row) {
        if (this._cellsCountPerPage == 0)
            return;

        var cell = this._executeDataAdapterCallback(this._dequeueCell(), idx);
        cell.setIdx(idx);
        cell.setRow(row);
        cell.setContentSize(this._cellsSize);
        cell.setAnchorPoint(cc.p(0, 1));
        cell.setPosition(this.cellPositionFromIndex(idx));
        this.addChild(cell);
        this.insertSortableCell(cell, idx);
        this._indices[idx] = true;
    },

    /**
     * 根据index获取cell设置的位置
     * @param {Number} idx
     * @returns {*}
     */
    cellPositionFromIndex: function (idx) {
        if(idx == cc.INVALID_INDEX){
            idx = 0;
        }
        var newIndex = idx - this._cellsCountPerPage * this._curPageNum;
//        console.log(idx,newIndex)
        return this._positions[newIndex];
    },

    _cellBeginRowFromOffset: function (offset, target, innerHeight) {
        var ofy = offset.y + innerHeight,
            xos = ofy - target.getContentSize().height,
            row = 0 | (xos / this._cellsSize.height);

        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    _cellEndRowFromOffset: function (offset,target,innerHeight) {
        var ofy = offset.y + innerHeight,
            row = 0 | (ofy / this._cellsSize.height);
        return Math.min(this._rows - 1, Math.max(row, 0));
    },

    _cellBeginColumnFromOffset: function (offset,target) {
        var column = 0 | Math.abs(offset.x / this._cellsSize.width);
        return column;
    },

    _cellEndColumnFromOffset: function (offset,target) {
        var ofx = Math.abs(offset.x) + target.getContentSize().width,
            column = Math.ceil(ofx / this._cellsSize.width);
        return column;
    },

    _cellFirstIndexFromRow: function (row) {
        return this._columns * row + this._cellsCountPerPage * this._curPageNum;
    }
});

ccs.GridView.create = function (cellSize, col, row, selector, target) {
    var view = new ccs.GridView();
    view.init(cellSize, col, row, selector, target);
    return view;
};