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

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {

    var _p = cc.Director.prototype;

    _p.setProjection = function (projection) {
        var size = this._winSizeInPoints;

        this.setViewport();

        switch (projection) {
            case cc.DIRECTOR_PROJECTION_2D:
                cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                cc.kmGLLoadIdentity();
                var orthoMatrix = new cc.kmMat4();
                cc.kmMat4OrthographicProjection(orthoMatrix, 0, size.width, 0, size.height, -1024, 1024);
                cc.kmGLMultMatrix(orthoMatrix);
                cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                cc.kmGLLoadIdentity();
                break;
            case cc.DIRECTOR_PROJECTION_3D:
                var zeye = this.getZEye();
                var matrixPerspective = new cc.kmMat4(), matrixLookup = new cc.kmMat4();
                cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                cc.kmGLLoadIdentity();

                // issue #1334
                cc.kmMat4PerspectiveProjection(matrixPerspective, 60, size.width / size.height, 0.1, zeye * 2);

                cc.kmGLMultMatrix(matrixPerspective);

                cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                cc.kmGLLoadIdentity();
                var eye = cc.kmVec3Fill(null, size.width / 2, size.height / 2, zeye);
                var center = cc.kmVec3Fill(null, size.width / 2, size.height / 2, 0.0);
                var up = cc.kmVec3Fill(null, 0.0, 1.0, 0.0);
                cc.kmMat4LookAt(matrixLookup, eye, center, up);
                cc.kmGLMultMatrix(matrixLookup);
                break;
            case cc.DIRECTOR_PROJECTION_CUSTOM:
                if (this._projectionDelegate)
                    this._projectionDelegate.updateProjection();
                break;
            default:
                cc.log("cocos2d: Director: unrecognized projection");
                break;
        }
        this._projection = projection;
        cc.eventManager.dispatchEvent(this._eventProjectionChanged);
        cc.setProjectionMatrixDirty();
    };

    _p.setDepthTest = function (on) {

        var loc_gl= cc._renderContext;
        if (on) {
            loc_gl.clearDepth(1.0);
            loc_gl.enable(loc_gl.DEPTH_TEST);
            loc_gl.depthFunc(loc_gl.LEQUAL);
            //cc._renderContext.hint(cc._renderContext.PERSPECTIVE_CORRECTION_HINT, cc._renderContext.NICEST);
        } else {
            loc_gl.disable(loc_gl.DEPTH_TEST);
        }
        //cc.CHECK_GL_ERROR_DEBUG();
    };

    _p.setOpenGLView = function (openGLView) {
        // set size
        this._winSizeInPoints.width = cc._canvas.width;      //this._openGLView.getDesignResolutionSize();
        this._winSizeInPoints.height = cc._canvas.height;
        this._openGLView = openGLView || cc.view;

        // Configuration. Gather GPU info
        var conf = cc.configuration;
        conf.gatherGPUInfo();
        conf.dumpInfo();

        // set size
        //this._winSizeInPoints = this._openGLView.getDesignResolutionSize();
        //this._winSizeInPixels = cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);

        //if (this._openGLView != openGLView) {
        // because EAGLView is not kind of CCObject

        this._createStatsLabel();

        //if (this._openGLView)
        this.setGLDefaultValues();

        /* if (this._contentScaleFactor != 1) {
         this.updateContentScaleFactor();
         }*/

        //}
    };

    _p._clear = function() {
        var gl = cc._renderContext;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    _p._beforeVisitScene = function() {
        cc.kmGLPushMatrix();
    };

    _p._afterVisitScene = function() {
        cc.kmGLPopMatrix();
    };

    _p._createStatsLabel = function(){
        if(!cc.LabelAtlas)
            return this._createStatsLabelForCanvas();

        if((cc.Director._fpsImageLoaded == null) || (cc.Director._fpsImageLoaded == false))
            return;

        var texture = new cc.Texture2D();
        texture.initWithElement(cc.Director._fpsImage);
        texture.handleLoadedTexture();

        /*
         We want to use an image which is stored in the file named ccFPSImage.c
         for any design resolutions and all resource resolutions.

         To achieve this,

         Firstly, we need to ignore 'contentScaleFactor' in 'CCAtlasNode' and 'CCLabelAtlas'.
         So I added a new method called 'setIgnoreContentScaleFactor' for 'CCAtlasNode',
         this is not exposed to game developers, it's only used for displaying FPS now.

         Secondly, the size of this image is 480*320, to display the FPS label with correct size,
         a factor of design resolution ratio of 480x320 is also needed.
         */
        var factor = cc.view.getDesignResolutionSize().height / 320.0;
        if(factor === 0)
            factor = this._winSizeInPoints.height / 320.0;

        var tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("00.0", texture, 12, 32 , '.');
        tmpLabel.scale = factor;
        this._FPSLabel = tmpLabel;

        tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("0.000", texture, 12, 32, '.');
        tmpLabel.scale = factor;
        this._SPFLabel = tmpLabel;

        tmpLabel = new cc.LabelAtlas();
        tmpLabel._setIgnoreContentScaleFactor(true);
        tmpLabel.initWithString("000", texture, 12, 32, '.');
        tmpLabel.scale = factor;
        this._drawsLabel = tmpLabel;

        var locStatsPosition = cc.DIRECTOR_STATS_POSITION;
        this._drawsLabel.setPosition(locStatsPosition.x, 34 * factor + locStatsPosition.y);
        this._SPFLabel.setPosition(locStatsPosition.x, 17 * factor + locStatsPosition.y);
        this._FPSLabel.setPosition(locStatsPosition);
    };

    _p._createStatsLabelForCanvas = function(){
        //The original _createStatsLabelForCanvas method
        //Because the referenced by a cc.Director.prototype._createStatsLabel
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