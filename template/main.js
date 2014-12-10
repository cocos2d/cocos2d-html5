cc.game.onStart = function(){
    var designSize = cc.size(480, 800);
    var screenSize = cc.view.getFrameSize();

    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);

    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MyScene());
    }, this);
};
cc.game.run();





