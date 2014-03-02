/**
 * 网格的scrollView
 */
ccs.GridScrollView = ccs.ScrollView.extend({
    _gridView:null,
    init : function(viewSize, cellSize, col, totalCellsCount, selector, target){
        this._super();
        this.setSize(viewSize);
        this.setTouchEnabled(true);
        this.setDirection(ccs.ScrollViewDir.both);

        var row = Math.ceil(totalCellsCount / col);
        var innerSize = cc.size(cellSize.width * col, cellSize.height * row);
        this.setInnerContainerSize(innerSize);

        this._gridView = ccs.GridView.create(cellSize, col, row, selector, target);
        this._gridView.reloadData();
        this.addChild(this._gridView);

        this.addEventListenerScrollView(this._onScrolling, this);
    },
    _onScrolling:function(){
        var offset = this.getInnerContainer().getPosition(),
            InnerHeight = this.getInnerContainer().getContentSize().height;
        this._gridView._updateData(offset,this,InnerHeight);
    }
});

/**
 * @param viewSize 视窗尺寸
 * @param cellSize 格子尺寸
 * @param col 单页的列数
 * @param totalCellsCount 所有格子的数量
 * @param selector
 * @param target
 * @returns {ccs.GridScrollView}
 *
 * @example
 *
 *     var gridScrollView = ccs.GridScrollView.create(
 *              cc.size(240,160),cc.size(24,16),
 *              30,this._data.length, this.gridviewDataSource, this);
 *     gridScrollView.setDirection(ccs.ScrollViewDir.horizontal);
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
ccs.GridScrollView.create = function(viewSize, cellSize, col, totalCellsCount, selector, target){
    var c = new ccs.GridScrollView();
    c.init(viewSize, cellSize, col, totalCellsCount, selector, target);
    return c;
};