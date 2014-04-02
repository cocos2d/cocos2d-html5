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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.Director.prototype;

    _p.setProjection = function (projection) {
        this._projection = projection;
        cc.eventManager.dispatchEvent(this._eventProjectionChanged);
    };

    _p.setDepthTest = function () {
        return;
    };

    _p.setOpenGLView = function (openGLView) {
        // set size
        this._winSizeInPoints.width = cc._canvas.width;      //this._openGLView.getDesignResolutionSize();
        this._winSizeInPoints.height = cc._canvas.height;
        this._openGLView = openGLView || cc.view;

        return;
    };

    _p._clear = function() {
        var viewport = this._openGLView.getViewPortRect();
        cc._renderContext.clearRect(-viewport.x, viewport.y, viewport.width, -viewport.height);
    };


    _p._createStatsLabel = function(){
        var fontSize = 0;
        if (this._winSizeInPoints.width > this._winSizeInPoints.height)
            fontSize = 0 | (this._winSizeInPoints.height / 320 * 24);
        else
            fontSize = 0 | (this._winSizeInPoints.width / 320 * 24);

        this._FPSLabel = cc.LabelTTF.create("000.0", "Arial", fontSize);
        this._SPFLabel = cc.LabelTTF.create("0.000", "Arial", fontSize);
        this._drawsLabel = cc.LabelTTF.create("0000", "Arial", fontSize);

        var locStatsPosition = cc.DIRECTOR_STATS_POSITION;
        this._drawsLabel.setPosition(this._drawsLabel.width / 2 + locStatsPosition.x, this._drawsLabel.height * 5 / 2 + locStatsPosition.y);
        this._SPFLabel.setPosition(this._SPFLabel.width / 2 + locStatsPosition.x, this._SPFLabel.height * 3 / 2 + locStatsPosition.y);
        this._FPSLabel.setPosition(this._FPSLabel.width / 2 + locStatsPosition.x, this._FPSLabel.height / 2 + locStatsPosition.y);
    };
}