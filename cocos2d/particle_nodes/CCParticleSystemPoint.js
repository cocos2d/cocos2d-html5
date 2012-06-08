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

var cc = cc = cc || {};

cc.MAX_PARTICLE_SIZE = 64;

/** @brief CCParticleSystemPoint is a subclass of CCParticleSystem
 Attributes of a Particle System:
 * All the attributes of Particle System

 Features:
 * consumes small memory: uses 1 vertex (x,y) per particle, no need to assign tex coordinates
 * size can't be bigger than 64
 * the system can't be scaled since the particles are rendered using GL_POINT_SPRITE

 Limitations:
 * On 3rd gen iPhone devices and iPads, this node performs MUCH slower than CCParticleSystemQuad.
 */
cc.ParticleSystemPoint = cc.ParticleSystem.extend({
    //! Array of (x,y,size)
    _vertices:null,
    //! vertices buffer id
    _verticesID:0,
    //ctor:function(){this._super();},

    // super methods
    initWithTotalParticles:function (numberOfParticles) {
        if (this._super(numberOfParticles)) {
            this._vertices = [];
            for (var i = 0; i < this._totalParticles; i++) {
                this._vertices[i] = new cc.PointSprite(new cc.Vertex2F(0, 0), new cc.Color4B(0, 0, 0, 255), 0);
            }

            if (!this._vertices) {
                cc.Log("cocos2d: Particle system: not enough memory");
                return false;
            }

            if (cc.USES_VBO) {
                glGenBuffers(1, this._verticesID);

                // initial binding
                glBindBuffer(GL_ARRAY_BUFFER, this._verticesID);
                glBufferData(GL_ARRAY_BUFFER, sizeof(cc.PointSprite) * this._totalParticles, this._vertices, GL_DYNAMIC_DRAW);
                glBindBuffer(GL_ARRAY_BUFFER, 0);
            }
            return true;
        }
        return false;
    },

    updateQuadWithParticle:function (particle, newPosition) {
        // place vertices and colos in array
        this._vertices[this._particleIdx].pos = new cc.Vertex2(newPosition.x, newPosition.y);
        this._vertices[this._particleIdx].size = particle.size;
        var color = new cc.Color4B((particle.color.r * 255), (particle.color.g * 255), (particle.color.b * 255), (particle.color.a * 255));
        this._vertices[this._particleIdx].color = color;
    },

    postStep:function () {
        if (cc.USES_VBO) {
            glBindBuffer(GL_ARRAY_BUFFER, this._verticesID);
            glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(cc.PointSprite) * this._particleCount, this._vertices);
            glBindBuffer(GL_ARRAY_BUFFER, 0);
        }
    },
    draw:function () {
        //TODO
        this._super();

        if (this._particleIdx == 0) {
            return;
        }

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY
        // Unneeded states: GL_TEXTURE_COORD_ARRAY
        glDisableClientState(GL_TEXTURE_COORD_ARRAY);

        glBindTexture(GL_TEXTURE_2D, this._texture.getName());

        glEnable(GL_POINT_SPRITE_OES);
        glTexEnvi(GL_POINT_SPRITE_OES, GL_COORD_REPLACE_OES, GL_TRUE);

        var pointSize = sizeof(this._vertices[0]);

        if (cc.USES_VBO) {
            glBindBuffer(GL_ARRAY_BUFFER, verticesID);

            if (cc.ENABLE_CACHE_TEXTTURE_DATA)
                glBufferData(GL_ARRAY_BUFFER, sizeof(cc.PointSprite) * this._totalParticles, this._vertices, GL_DYNAMIC_DRAW);

            glVertexPointer(2, GL_FLOAT, pointSize, 0);

            glColorPointer(4, GL_UNSIGNED_BYTE, pointSize, offsetof(cc.PointSprite, color));

            glEnableClientState(GL_POINT_SIZE_ARRAY_OES);

            glPointSizePointerOES(GL_FLOAT, pointSize, offsetof(cc.PointSprite, size));
        } else {
            var offset = this._vertices.length;
            glVertexPointer(2, GL_FLOAT, pointSize, offset);

            var diff = offsetof(cc.PointSprite, color);
            glColorPointer(4, GL_UNSIGNED_BYTE, pointSize, (offset + diff));

            glEnableClientState(GL_POINT_SIZE_ARRAY_OES);
            diff = offsetof(cc.PointSprite, size);
            glPointSizePointerOES(GL_FLOAT, pointSize, (offset + diff));
        }

        var newBlend = (this._blendFunc.src != cc.BLEND_SRC || this._blendFunc.dst != cc.BLEND_DST) ? true : false;
        if (newBlend) {
            glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        }

        glDrawArrays(GL_POINTS, 0, this._particleIdx);

        // restore blend state
        if (newBlend)
            glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        // unbind VBO buffer
        if (cc.USES_VBO)
            glBindBuffer(GL_ARRAY_BUFFER, 0);

        glDisableClientState(GL_POINT_SIZE_ARRAY_OES);
        glDisable(GL_POINT_SPRITE_OES);

        // restore GL default state
        glEnableClientState(GL_TEXTURE_COORD_ARRAY);
    },
    setStartSpin:function (varValue) {
        cc.Assert(varValue == 0, "PointParticleSystem doesn't support spinning");
        this._super(varValue);
    },
    setStartSpinVar:function (varValue) {
        cc.Assert(varValue == 0, "PointParticleSystem doesn't support spinning");
        this._super(varValue);
    },
    setEndSpin:function (varValue) {
        cc.Assert(varValue == 0, "PointParticleSystem doesn't support spinning");
        this._super(varValue);
    },
    setEndSpinVar:function (varValue) {
        cc.Assert(varValue == 0, "PointParticleSystem doesn't support spinning");
        this._super(varValue);
    },
    //
    // SIZE > 64 IS NOT SUPPORTED
    //
    setStartSize:function (varValue) {
        cc.Assert(((varValue >= 0) && (varValue <= cc.MAX_PARTICLE_SIZE)), "PointParticleSystem only supports 0 <= size <= 64");
        this._super(varValue);
    },
    setEndSize:function (varValue) {
        cc.Assert(((varValue == cc.CCPARTICLE_START_SIZE_EQUAL_TO_END_SIZE) ||
            ( varValue >= 0 && varValue <= cc.MAX_PARTICLE_SIZE)), "PointParticleSystem only supports 0 <= size <= 64");
        this._super(varValue);
    }
});

/** creates an initializes a CCParticleSystemPoint from a plist file.
 This plist files can be creted manually or with Particle Designer:
 */
cc.ParticleSystemPoint.create = function (plistFile) {
    var ret = new cc.ParticleSystemPoint();
    if (ret && ret.initWithFile(plistFile)) {
        return ret;
    }
    return null;
};
