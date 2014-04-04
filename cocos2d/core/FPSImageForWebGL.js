cc.Director._fpsImage = new Image();
cc._addEventListener(cc.Director._fpsImage, "load", function () {
    cc.Director._fpsImageLoaded = true;
});
if(cc._fpsImage){
    cc.Director._fpsImage.src = cc._fpsImage;
}

