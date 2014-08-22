cc.Sprite.prototype.setBorder = function(cr, cg, cb, ca , r, f){
    var _dfc = cc.color.WHITE;
    r = r || (arguments.length == 2 ? cg : 5);
    f = f || 1;//精细度
    switch (arguments.length){
        case 0: cr = _dfc.r; cg = _dfc.g; cb = _dfc.b; ca = _dfc.a; break;
        case 1:
        case 2: cg = cr.g; cb = cr.b; ca = cr.a; cr = cr.r; break;
        case 3: ca = _dfc.a; break;
    }
    var that = this,
        x = that.x, y = that.y,
        w = that.width, h = that.height,
        dc = cc.size(w + r, h + r);
    that.removeBorder();

    var mTxt = new cc.RenderTexture(dc.width, dc.height),
        cx = 0,  ox = dc.width / 2, oy = dc.height / 2;

    var visitSprite = function(xx, yy){
        if(cc.sys.isNative){
            var spr = new cc.Sprite(that.getTexture());
            spr.attr({x : xx, y : yy, width :  w, height : h});
            spr.visit();
        } else {
            that.setPosition(xx, yy);
            that.visit();
        }
    };

    mTxt.beginWithClear(0, 0, 0, 0);
    for(var rd = 0; rd <= r; rd += f){
        cx = Math.sqrt(Math.pow(r, 2) - Math.pow(rd, 2));
        visitSprite(ox + rd, oy + cx);
        visitSprite(ox - rd, oy + cx);
        visitSprite(ox - rd, oy - cx);
        visitSprite(ox + rd, oy - cx);
    }
    mTxt.end();
    that.setPosition(x, y);

    var nTxt = new cc.RenderTexture(dc.width, dc.height);
    nTxt.setPosition(w / 2, h / 2);

    mTxt.setPosition(ox, oy);
    mTxt.getSprite().setBlendFunc(cc.ZERO, cc.SRC_ALPHA);
    nTxt.beginWithClear(cr, cg, cb, ca);
    mTxt.visit();
    nTxt.end();

    that.addChild(that.borderTex = nTxt, -1);
    return nTxt;
};

cc.Sprite.prototype.removeBorder = function(){
    this.borderTex && this.borderTex.removeFromParent(true);
};

var MyLayer = cc.Layer.extend({
    helloLabel:null,
    sprite:null,

    init:function () {

        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.director.getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            s_CloseNormal,
            s_CloseSelected,
            function () {
                cc.log("close");
            },this);
        closeItem.setAnchorPoint(0.5, 0.5);

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(0, 0);
        this.addChild(menu, 1);
        closeItem.setPosition(size.width - 20, 20);

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        this.helloLabel = cc.LabelTTF.create("Hello World", "Impact", 38);
        // position the label on the center of the screen
        this.helloLabel.setPosition(size.width / 2, size.height - 40);
        // add the label as a child to this layer
        this.addChild(this.helloLabel, 5);

        // add "Helloworld" splash screen"
        this.sprite = cc.Sprite.create(s_HelloWorld);
        this.sprite.setAnchorPoint(0.5, 0.5);
        this.sprite.setPosition(size.width / 2, size.height / 2);
        this.sprite.setScale(size.height/this.sprite.getContentSize().height);
        this.addChild(this.sprite, 0);
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
