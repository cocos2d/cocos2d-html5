cc.game.onStart = function(){
    var designSize = cc.size(480, 800);
    var screenSize = cc.view.getFrameSize();

    if(!cc.sys.isNative && screenSize.height < 800){
        designSize = cc.size(320, 480);
        cc.loader.resPath = "res/Normal";
    }else{
        cc.loader.resPath = "res/HD";
    }
    cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);

    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MyScene());
    }, this);
};
cc.game.run();

var node = new cc.Node;
node.setColor({r:100,g:200,b:255});
var test = cc.Serializer.serialize(node);
var node2 = cc.Serializer.unSerialize(test);

var root = new cc.Node;
var child1 = new cc.Node;
child1.name = "child1";
var child2 = new cc.Node;
child2.name = "child2";

root.addChild(child1);
root.addChild(child2);

var test2 = cc.Serializer.serialize(root);

var revivedRoot = cc.Serializer.unSerialize(test2);



var obj = {
    a:"a",
    b:"b",
    children:[{
            a:"a",
            b:"b",
            children:[]
        },
        {
            a:"a",
            b:"b",
            children:[]
        }]


};





