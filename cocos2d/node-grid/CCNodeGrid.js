/**
 * Created by Huabin LING on 3/8/14.
 */

/**
 * <p>NodeGrid class is a class serves as a decorator of cc.Node,<br/>
 * Any node can be wrapped by this class to permit them to run grid actions.</p>
 * @type {Class}
 *
 * @property {cc.GridBase}  grid    - Grid object that is used when applying effects
 * @property {cc.Node}      target  - Target node that is used when applying effects
 */
cc.NodeGrid = cc.Node.extend({
	grid: null,
	_target: null,

	getGrid: function() {
		return this.grid;
	},

	setGrid: function(grid) {
		this.grid = grid;
	},

	setTarget: function(target) {
		//var self = this;
		//self._target && self.removeChild(self._target);
		this._target = target;
		//self.addChild(self._target);
	},

	getTarget: function() {
		return this._target;
	},

	visit: function() {
		var self = this;
		// quick return if not visible
		if (!self._visible)
			return;

		var isWebGL = cc._renderType == cc._RENDER_TYPE_WEBGL;
		var locGrid = self.grid;
		if (isWebGL && locGrid && locGrid._active)
			locGrid.beforeDraw();

		self.transform();

		self.target.visit();

		if (isWebGL && locGrid && locGrid._active)
			locGrid.afterDraw(self.target);
	},

	_transformForWebGL: function () {
		//optimize performance for javascript
		var t4x4 = this._transform4x4,  topMat4 = cc.current_stack.top;

		// Convert 3x3 into 4x4 matrix
		//cc.CGAffineToGL(this.nodeToParentTransform(), this._transform4x4.mat);
		var trans = this.nodeToParentTransform();
		var t4x4Mat = t4x4.mat;
		t4x4Mat[0] = trans.a;
		t4x4Mat[4] = trans.c;
		t4x4Mat[12] = trans.tx;
		t4x4Mat[1] = trans.b;
		t4x4Mat[5] = trans.d;
		t4x4Mat[13] = trans.ty;

		// Update Z vertex manually
		//this._transform4x4.mat[14] = this._vertexZ;
		t4x4Mat[14] = this._vertexZ;

		//optimize performance for Javascript
		cc.kmMat4Multiply(topMat4, topMat4, t4x4); // = cc.kmGLMultMatrix(this._transform4x4);

		// XXX: Expensive calls. Camera should be integrated into the cached affine matrix
		if (this._camera != null && !(this.grid && this.grid.isActive())) {
			var apx = this._anchorPointInPoints.x, apy = this._anchorPointInPoints.y;
			var translate = (apx !== 0.0 || apy !== 0.0);
			if (translate){
				cc.kmGLTranslatef(cc.RENDER_IN_SUBPIXEL(apx), cc.RENDER_IN_SUBPIXEL(apy), 0);
				this._camera.locate();
				cc.kmGLTranslatef(cc.RENDER_IN_SUBPIXEL(-apx), cc.RENDER_IN_SUBPIXEL(-apy), 0);
			} else {
				this._camera.locate();
			}
		}
	}
});

window._p = cc.NodeGrid.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
	_p.transform = _p._transformForWebGL;
}else{
	_p.transform = _p._transformForCanvas;
}
// Extended property
/** @expose */
_p.grid;
/** @expose */
_p.target;
cc.defineGetterSetter(_p, "target", _p.getTarget, _p.setTarget);
delete window._p;

cc.NodeGrid.create = function(target, grid) {
	var node = new cc.NodeGrid();
	if (node) {
		target && (node.target = target);
		grid && (node.grid = grid);
		return node;
	}
	return null;
};