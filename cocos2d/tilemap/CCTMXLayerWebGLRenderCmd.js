/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

(function () {
    cc.TMXLayer.WebGLRenderCmd = function (renderableObject) {
        this._rootCtor(renderableObject);
        this._needDraw = true;
        this._vertices = [
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0}
        ];
        this._color = new Uint32Array(1);
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST);

        var radian = Math.PI * 90 / 180;
        this._sin90 = Math.sin(radian);
        this._cos90 = Math.cos(radian);
        radian = radian * 3;
        this._sin270 = Math.sin(radian);
        this._cos270 = Math.cos(radian);
    };

    var proto = cc.TMXLayer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.TMXLayer.WebGLRenderCmd;

    proto.uploadData = function (f32buffer, ui32buffer, vertexDataOffset) {
        var node = this._node, hasRotation = (node._rotationX || node._rotationY),
            layerOrientation = node.layerOrientation,
            tiles = node.tiles;

        if (!tiles) {
            return 0;
        }

        var scalex = cc.view._scaleX,
            scaley = cc.view._scaleY,
            maptw = node._mapTileSize.width,
            mapth = node._mapTileSize.height,
            tilew = node.tileset._tileSize.width / cc.director._contentScaleFactor,
            tileh = node.tileset._tileSize.height / cc.director._contentScaleFactor,
            extw = tilew - maptw,
            exth = tileh - mapth,
            winw = cc.winSize.width,
            winh = cc.winSize.height,
            rows = node._layerSize.height,
            cols = node._layerSize.width,
            grids = node._texGrids,
            spTiles = node._spriteTiles,
            wt = this._worldTransform,
            a = wt.a, b = wt.b, c = wt.c, d = wt.d, tx = wt.tx, ty = wt.ty,
            ox = -node._contentSize.width * node._anchorPoint.x,
            oy = -node._contentSize.height * node._anchorPoint.y,
            mapx = ox * a + oy * c + tx,
            mapy = ox * b + oy * d + ty;

        var opacity = node._opacity,
            cr = this._displayedColor.r,
            cg = this._displayedColor.g,
            cb = this._displayedColor.b;
        if (node._opacityModifyRGB) {
            var ca = opacity / 255;
            cr *= ca;
            cg *= ca;
            cb *= ca;
        }
        this._color[0] = ((opacity << 24) | (cb << 16) | (cg << 8) | cr);

        // Culling
        var startCol = 0, startRow = 0,
            maxCol = cols, maxRow = rows;
        if (!hasRotation && layerOrientation === cc.TMX_ORIENTATION_ORTHO) {
            startCol = Math.floor(-(mapx - extw * a) / (maptw * a));
            startRow = Math.floor((mapy - exth * d + mapth * rows * d - winh) / (mapth * d));
            maxCol = Math.ceil((winw - mapx + extw * a) / (maptw * a));
            maxRow = rows - Math.floor(-(mapy + exth * d) / (mapth * d));
            // Adjustment
            if (startCol < 0) startCol = 0;
            if (startRow < 0) startRow = 0;
            if (maxCol > cols) maxCol = cols;
            if (maxRow > rows) maxRow = rows;
        }

        var row, col,
            offset = vertexDataOffset,
            colOffset = startRow * cols, z, gid, grid,
            mask = cc.TMX_TILE_FLIPPED_MASK,
            i, top, left, bottom, right,
            w = tilew * a, h = tileh * d, gt, gl, gb, gr,
            wa = a, wb = b, wc = c, wd = d, wtx = tx, wty = ty, // world
            flagged = false, flippedX = false, flippedY = false,
            vertices = this._vertices;
        for (row = startRow; row < maxRow; ++row) {
            for (col = startCol; col < maxCol; ++col) {
                // No more buffer
                if (offset + 24 > f32buffer.length) {
                    cc.renderer._increaseBatchingSize((offset - vertexDataOffset) / 6);
                    cc.renderer._batchRendering();
                    vertexDataOffset = 0;
                    offset = 0;
                }

                z = colOffset + col;
                // Skip sprite tiles
                if (spTiles[z]) {
                    continue;
                }

                gid = node.tiles[z];
                grid = grids[(gid & mask) >>> 0];
                if (!grid) {
                    continue;
                }

                // Vertices
                switch (layerOrientation) {
                case cc.TMX_ORIENTATION_ORTHO:
                    left = col * maptw;
                    bottom = (rows - row - 1) * mapth;
                    z = node._vertexZ + cc.renderer.assignedZStep * z / tiles.length;
                    break;
                case cc.TMX_ORIENTATION_ISO:
                    left = maptw / 2 * ( cols + col - row - 1);
                    bottom = mapth / 2 * ( rows * 2 - col - row - 2);
                    z = node._vertexZ + cc.renderer.assignedZStep * (node.height - bottom) / node.height;
                    break;
                case cc.TMX_ORIENTATION_HEX:
                    left = col * maptw * 3 / 4;
                    bottom = (rows - row - 1) * mapth + ((col % 2 === 1) ? (-mapth / 2) : 0);
                    z = node._vertexZ + cc.renderer.assignedZStep * (node.height - bottom) / node.height;
                    break;
                }
                right = left + tilew;
                top = bottom + tileh;
                // TMX_ORIENTATION_ISO trim
                if (!hasRotation && layerOrientation === cc.TMX_ORIENTATION_ISO) {
                    gb = mapy + bottom * d;
                    if (gb > winh + h) {
                        col += Math.floor((gb - winh) * 2 / h) - 1;
                        continue;
                    }
                    gr = mapx + right * a;
                    if (gr < -w) {
                        col += Math.floor((-gr) * 2 / w) - 1;
                        continue;
                    }
                    gl = mapx + left * a;
                    gt = mapy + top * d;
                    if (gl > winw || gt < 0) {
                        col = maxCol;
                        continue;
                    }
                }
                // Rotation and Flip
                if (gid > cc.TMX_TILE_DIAGONAL_FLAG) {
                    flagged = true;
                    flippedX = (gid & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0;
                    flippedY = (gid & cc.TMX_TILE_VERTICAL_FLAG) >>> 0;
                    // if ((gid & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0) {
                    //     var flag = (gid & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0;
                    //     // handle the 4 diagonally flipped states.
                    //     var la, lb, lc, ld;
                    //     if (flag === cc.TMX_TILE_HORIZONTAL_FLAG || flag === (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                    //         lb = -(lc = this._sin90);
                    //         la = ld = this._cos90;
                    //     }
                    //     else {
                    //         lb = -(lc = this._sin270);
                    //         la = ld = this._cos270;
                    //     }
                    //     left += grid.width * scalex / 2;
                    //     bottom += grid.height * scaley / 2;
                    //     wa = la * a + lb * c;
                    //     wb = la * b + lb * d;
                    //     wc = lc * a + ld * c;
                    //     wd = lc * b + ld * d;
                    //     wtx = a * left + c * bottom + tx;
                    //     wty = d * bottom + ty + b * left;
                    //     right = right - left;
                    //     top = top - bottom;
                    //     left = -right;
                    //     bottom = -top;
                    // }
                }

                vertices[0].x = left * wa + top * wc + wtx; // tl
                vertices[0].y = left * wb + top * wd + wty;
                vertices[1].x = left * wa + bottom * wc + wtx; // bl
                vertices[1].y = left * wb + bottom * wd + wty;
                vertices[2].x = right * wa + top * wc + wtx; // tr
                vertices[2].y = right * wb + top * wd + wty;
                vertices[3].x = right * wa + bottom * wc + wtx; // br
                vertices[3].y = right * wb + bottom * wd + wty;

                for (i = 0; i < 4; ++i) {
                    f32buffer[offset] = vertices[i].x;
                    f32buffer[offset + 1] = vertices[i].y;
                    f32buffer[offset + 2] = z;
                    ui32buffer[offset + 3] = this._color[0];
                    switch (i) {
                    case 0: // tl
                        f32buffer[offset + 4] = flippedX ? grid.r : grid.l;
                        f32buffer[offset + 5] = flippedY ? grid.b : grid.t;
                        break;
                    case 1: // bl
                        f32buffer[offset + 4] = flippedX ? grid.r : grid.l;
                        f32buffer[offset + 5] = flippedY ? grid.t : grid.b;
                        break;
                    case 2: // tr
                        f32buffer[offset + 4] = flippedX ? grid.l : grid.r;
                        f32buffer[offset + 5] = flippedY ? grid.b : grid.t;
                        break;
                    case 3: // br
                        f32buffer[offset + 4] = flippedX ? grid.l : grid.r;
                        f32buffer[offset + 5] = flippedY ? grid.t : grid.b;
                        break;
                    }

                    offset += 6;
                }
                if (flagged) {
                    wa = a;
                    wb = b;
                    wc = c;
                    wd = d;
                    wtx = tx;
                    wty = ty;
                    flippedX = false;
                    flippedY = false;
                    flagged = false;
                }
            }
            colOffset += cols;
        }
        return (offset - vertexDataOffset) / 6;
    };
})();
