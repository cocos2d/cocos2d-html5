cc.Director._fpsImage = new Image();
cc.Director._fpsImage.addEventListener("load", function () {
    cc.Director._fpsImageLoaded = true;
});
if(cc._fpsImage){
    cc.Director._fpsImage.src = cc._fpsImage;
}

