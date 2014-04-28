cc._spAtlasPage_createTexture = function (self, path) {
    var texture = cc.TextureCache.getInstance().addImage(path);
    self.rendererObject = cc.TextureAtlas.createWithTexture(texture, 128);
    self.width = texture.getPixelsWide();
    self.height = texture.getPixelsHigh();
};

cc._spAtlasPage_disposeTexture = function (self) {
    self.rendererObject.release();
};

cc._spAtlasLoader = {
    spAtlasFile:null,
    setAtlasFile:function(spAtlasFile){
        this.spAtlasFile = spAtlasFile;
    },
    load:function(page, line, spAtlas){
        var texturePath = cc.FileUtils.getInstance().fullPathFromRelativeFile(line, this.spAtlasFile);
        cc._spAtlasPage_createTexture(page,texturePath);
    },
    unload:function(obj){

    }
};

/*cc._spCallback = function(state, trackIndex, type,event, loopCount){
    state.context.onAnimationStateEvent(trackIndex, type, event, loopCount);
};*/

cc._spRegionAttachment_updateQuad = function(self, slot, quad, premultipliedAlpha) {
    var vertices = {};
    self.computeVertices(slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
    var r = slot.skeleton.r * slot.r * 255;
    var g = slot.skeleton.g * slot.g * 255;
    var b = slot.skeleton.b * slot.b * 255;
    var normalizedAlpha = slot.skeleton.a * slot.a;
    if (premultipliedAlpha) {
        r *= normalizedAlpha;
        g *= normalizedAlpha;
        b *= normalizedAlpha;
    }
    var a = normalizedAlpha * 255;

    quad.bl.colors.r = r;
    quad.bl.colors.g = g;
    quad.bl.colors.b = b;
    quad.bl.colors.a = a;
    quad.tl.colors.r = r;
    quad.tl.colors.g = g;
    quad.tl.colors.b = b;
    quad.tl.colors.a = a;
    quad.tr.colors.r = r;
    quad.tr.colors.g = g;
    quad.tr.colors.b = b;
    quad.tr.colors.a = a;
    quad.br.colors.r = r;
    quad.br.colors.g = g;
    quad.br.colors.b = b;
    quad.br.colors.a = a;

    var VERTEX = cc.SP_VERTEX_INDEX;

    quad.bl.vertices.x = vertices[VERTEX.X1];
    quad.bl.vertices.y = vertices[VERTEX.Y1];
    quad.tl.vertices.x = vertices[VERTEX.X2];
    quad.tl.vertices.y = vertices[VERTEX.Y2];
    quad.tr.vertices.x = vertices[VERTEX.X3];
    quad.tr.vertices.y = vertices[VERTEX.Y3];
    quad.br.vertices.x = vertices[VERTEX.X4];
    quad.br.vertices.y = vertices[VERTEX.Y4];

    quad.bl.texCoords.u = self.uvs[VERTEX.X1];
    quad.bl.texCoords.v = self.uvs[VERTEX.Y1];
    quad.tl.texCoords.u = self.uvs[VERTEX.X2];
    quad.tl.texCoords.v = self.uvs[VERTEX.Y2];
    quad.tr.texCoords.u = self.uvs[VERTEX.X3];
    quad.tr.texCoords.v = self.uvs[VERTEX.Y3];
    quad.br.texCoords.u = self.uvs[VERTEX.X4];
    quad.br.texCoords.v = self.uvs[VERTEX.Y4];

};
