var s_pPathGrossini = "Resources/Images/grossini.png";
var s_pPathSister1 = "Resources/Images/grossinis_sister1.png";
var s_pPathSister2 = "Resources/Images/grossinis_sister2.png";
var s_pPathB1 = "Resources/Images/b1.png";
var s_pPathB2 = "Resources/Images/b2.png";
var s_pPathR1 = "Resources/Images/r1.png";
var s_pPathR2 = "Resources/Images/r2.png";
var s_pPathF1 = "Resources/Images/f1.png";
var s_pPathF2 = "Resources/Images/f2.png";
var s_pPathBlock = "Resources/Images/blocks.png";
var s_back = "Resources/Images/background.png";
var s_back1 = "Resources/Images/background1.png";
var s_back2 = "Resources/Images/background2.png";
var s_back3 = "Resources/Images/background3.png";
var s_stars1 = "Resources/Images/stars.png";
var s_stars2 = "Resources/Images/stars2.png";
var s_fire = "Resources/Images/fire.png";
var s_snow = "Resources/Images/snow.png";
var s_streak = "Resources/Images/streak.png";
var s_PlayNormal = "Resources/Images/btn-play-normal.png";
var s_PlaySelect = "Resources/Images/btn-play-selected.png";
var s_AboutNormal = "Resources/Images/btn-about-normal.png";
var s_AboutSelect = "Resources/Images/btn-about-selected.png";
var s_HighNormal = "Resources/Images/btn-highscores-normal.png";
var s_HighSelect = "Resources/Images/btn-highscores-selected.png";
var s_Ball = "Resources/Images/ball.png";
var s_Paddle = "Resources/Images/paddle.png";
var s_pPathClose = "Resources/Images/close.png";
var s_MenuItem = "Resources/Images/menuitemsprite.png";
var s_SendScore = "Resources/Images/SendScoreButton.png";
var s_PressSendScore = "Resources/Images/SendScoreButtonPressed.png";
var s_Power = "Resources/Images/powered.png";
var s_AtlasTest = "Resources/Images/atlastest.png";
// tilemaps resource
var s_TilesPng = "Resources/TileMaps/tiles.png";
var s_LevelMapTga = "Resources/TileMaps/levelmap.tga";
var s_fixedOrthoTest2Png = "Resources/TileMaps/fixed-ortho-test2.png";
var s_hexaTilesPng = "Resources/TileMaps/hexa-tiles.png";
var s_isoTestPng = "Resources/TileMaps/iso-test.png";
var s_isoTest2Png = "Resources/TileMaps/iso-test2.png";
var s_isoPng = "Resources/TileMaps/iso.png";
var s_orthoTest1BwPng = "Resources/TileMaps/ortho-test1_bw.png";
var s_tilesHdPng = "Resources/TileMaps/tiles-hd.png";
var s_tmwDesertSpacingHdPng = "Resources/TileMaps/tmw_desert_spacing-hd.png";
var s_tmwDesertSpacingPng = "Resources/TileMaps/tmw_desert_spacing.png";

var g_ressources = [
    //image ressources
    {type:"image", src:s_pPathGrossini},
    {type:"image", src:s_pPathSister1},
    {type:"image", src:s_pPathSister2},
    {type:"image", src:s_pPathB1},
    {type:"image", src:s_pPathB2},
    {type:"image", src:s_pPathR1},
    {type:"image", src:s_pPathR2},
    {type:"image", src:s_pPathF1},
    {type:"image", src:s_pPathF2},
    {type:"image", src:s_pPathBlock},
    {type:"image", src:s_back},
    {type:"image", src:s_back1},
    {type:"image", src:s_back2},
    {type:"image", src:s_back3},
    {type:"image", src:s_stars1},
    {type:"image", src:s_stars2},
    {type:"image", src:s_fire},
    {type:"image", src:s_snow},
    {type:"image", src:s_PlayNormal},
    {type:"image", src:s_PlaySelect},
    {type:"image", src:s_AboutNormal},
    {type:"image", src:s_AboutSelect},
    {type:"image", src:s_HighNormal},
    {type:"image", src:s_HighSelect},
    {type:"image", src:s_Ball},
    {type:"image", src:s_Paddle},
    {type:"image", src:s_pPathClose},
    {type:"image", src:s_MenuItem},
    {type:"image", src:s_SendScore},
    {type:"image", src:s_PressSendScore},
    {type:"image", src:s_Power},
    {type:"image", src:s_AtlasTest},
    {type:"image", src:s_TilesPng},
    {type:"image", src:s_streak},

    {type:"image", src:s_fixedOrthoTest2Png},
    {type:"image", src:s_hexaTilesPng},
    {type:"image", src:s_isoTestPng},
    {type:"image", src:s_isoTest2Png},
    {type:"image", src:s_isoPng},
    {type:"image", src:s_orthoTest1BwPng},
    {type:"image", src:s_tilesHdPng},
    {type:"image", src:s_tmwDesertSpacingHdPng},
    {type:"image", src:s_tmwDesertSpacingPng},

    //tmx ressources
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test1.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test1.tsx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test2.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test3.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test4.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test4-hd.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test5.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test6.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test6-hd.tmx"},
    {type:"tmx", src:"Resources/TileMaps/hexa-test.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test1.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test2.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test2-uncompressed.tmx"},
    {type:"tmx", src:"Resources/TileMaps/ortho-objects.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test-objectgroup.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test-zorder.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test-zorder.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test-vertexz.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test-vertexz.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test-movelayer.tmx"},
    {type:"tmx", src:"Resources/TileMaps/orthogonal-test-movelayer.tmx"},
    {type:"tmx", src:"Resources/TileMaps/iso-test-bug787.tmx"},
    {type:"tmx", src:"Resources/TileMaps/test-object-layer.tmx"},

    //tga ressources
    {type:"tga", src:s_LevelMapTga}
];
