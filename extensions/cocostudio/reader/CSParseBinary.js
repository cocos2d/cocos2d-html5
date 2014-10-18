var CSParseBinary = "\n\
package protocolbuffers;\n\
\n\
option optimize_for = LITE_RUNTIME; \n\
\n\
message CSParseBinary\n\
{\n\
    optional string version = 1; \n\
    optional string cocos2dVersion = 2;\n\
	optional string editorType = 3;\n\
    optional float dataScale = 4;\n\
    optional int32 designHeight = 5;\n\
    optional int32 designWidth = 6;    \n\
    repeated string textures = 7;\n\
    repeated string texturesPng = 8;\n\
    optional NodeTree nodeTree = 9;\n\
    optional NodeAction action = 10;\n\
}\n\
\n\
\n\
// nodeTree\n\
message NodeTree\n\
{\n\
    optional string classname = 1;\n\
    optional string name = 2;\n\
\n\
    repeated NodeTree children = 3;\n\
\n\
    optional WidgetOptions widgetOptions = 4;\n\
    optional ButtonOptions buttonOptions = 5;\n\
    optional CheckBoxOptions checkBoxOptions = 6;\n\
    optional ImageViewOptions imageViewOptions = 7;\n\
    \n\
    optional TextAtlasOptions textAtlasOptions = 8;\n\
    optional TextBMFontOptions textBMFontOptions = 9;\n\
    optional TextOptions textOptions = 10;\n\
    optional LoadingBarOptions loadingBarOptions = 11;\n\
    optional SliderOptions sliderOptions = 12;\n\
    optional TextFieldOptions textFieldOptions = 13;\n\
    optional ScrollViewOptions scrollViewOptions = 14;\n\
    optional PageViewOptions pageViewOptions = 15;\n\
    optional ListViewOptions listViewOptions = 16;\n\
    optional PanelOptions PanelOptions = 17;\n\
\n\
    optional SpriteOptions spriteOptions = 18;\n\
    optional TMXTiledMapOptions tmxTiledMapOptions = 19;\n\
    optional ParticleSystemOptions particleSystemOptions = 20;\n\
    optional ProjectNodeOptions projectNodeOptions = 21;\n\
}\n\
\n\
\n\
// WidgetOptions\n\
message WidgetOptions\n\
{\n\
    optional float x = 1;\n\
    optional float y = 2;\n\
    optional float scaleX = 3;\n\
    optional float scaleY = 4;\n\
    optional float rotation = 5;\n\
    optional bool flipX = 6;\n\
    optional bool flipY = 7;\n\
    optional int32 colorB = 8;\n\
    optional int32 colorG = 9;\n\
    optional int32 colorR = 10;\n\
    optional int32 opacity = 11;\n\
    optional bool touchAble = 12;\n\
    optional bool visible = 13;\n\
    optional int32 zorder = 14;\n\
    optional string classType = 15;\n\
    optional float width = 16;\n\
    optional float height = 17;\n\
    optional int32 positionType = 18;\n\
    optional float positionPercentX = 19;\n\
    optional float positionPercentY = 20;\n\
    optional int32 sizeType = 21;\n\
    optional float sizePercentX = 22;\n\
    optional float sizePercentY = 23;\n\
    optional bool useMergedTexture = 24;\n\
    optional int32 actionTag = 25;\n\
    optional int32 tag = 26;\n\
    optional float anchorPointX = 27;\n\
    optional float anchorPointY = 28;\n\
    optional bool ignoreSize = 29;\n\
    optional float rotationSkewX = 30;\n\
    optional float rotationSkewY = 31;\n\
    optional LayoutParameter layoutParameter = 32;\n\
    optional string customProperty = 33;\n\
    optional string frameEvent = 34;   \n\
    optional string name = 35;\n\
    optional int32 Alpha = 37;\n\
    repeated ComponentOptions componentOptions = 36;\n\
}\n\
\n\
// LayoutParameter\n\
message LayoutParameter\n\
{\n\
    optional int32 type = 1;\n\
    optional int32 gravity = 2;\n\
    optional string relativeName = 3;\n\
    optional string relativeToName = 4;\n\
    optional int32 align = 5;\n\
    optional int32 marginLeft = 6;\n\
    optional int32 marginTop = 7;\n\
    optional int32 marginRight = 8;\n\
    optional int32 marginDown = 9;\n\
    optional int32 layoutEageType = 10;\n\
    optional int32 layoutNormalHorizontal = 11;\n\
    optional int32 layoutNormalVertical = 12;\n\
    optional int32 layoutParentHorizontal = 13;\n\
    optional int32 layoutParentVertical = 14;\n\
}\n\
\n\
// ButtonOptions\n\
message ButtonOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string normal = 3;\n\
    optional string pressed = 4;\n\
    optional string disabled = 5;\n\
    optional ResourceData normalData = 6;\n\
    optional ResourceData pressedData = 7;\n\
    optional ResourceData disabledData = 8;\n\
    optional string text = 9;\n\
    optional string fontName = 10;\n\
    optional int32 fontSize = 11;\n\
    optional int32 textColorR = 12;\n\
    optional int32 textColorG = 13;\n\
    optional int32 textColorB = 14;\n\
    optional float capInsetsX = 15;\n\
    optional float capInsetsY = 16;\n\
    optional float capInsetsWidth = 17;\n\
    optional float capInsetsHeight = 18;\n\
    optional float scale9Width = 19;\n\
    optional float scale9Height = 20;\n\
    optional bool  scale9Enable = 21; \n\
    optional bool  displaystate = 22;\n\
    optional ResourceData   fontResource = 23;\n\
}\n\
\n\
message ResourceData\n\
{\n\
    optional string path = 1;\n\
    optional string plistFile = 2;\n\
    optional int32 resourceType = 3;\n\
}\n\
\n\
// CheckBoxOptions\n\
message CheckBoxOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string backGroundBox = 3;\n\
    optional string backGroundBoxSelected = 4;\n\
    optional string backGroundBoxDisabled = 5;\n\
    optional string frontCross = 6;\n\
    optional string frontCrossDisabled = 7;\n\
    optional ResourceData backGroundBoxData = 8;\n\
    optional ResourceData backGroundBoxSelectedData = 9;\n\
    optional ResourceData frontCrossData = 10;\n\
    optional ResourceData backGroundBoxDisabledData = 11;\n\
    optional ResourceData frontCrossDisabledData = 12;\n\
    optional bool selectedState = 13;\n\
	optional bool displaystate = 14;\n\
}\n\
\n\
// ImageOptions\n\
message ImageViewOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string fileName = 3;\n\
    optional ResourceData fileNameData = 4;\n\
    optional float capInsetsX = 5;\n\
    optional float capInsetsY = 6;\n\
    optional float capInsetsHeight = 7;\n\
    optional float capInsetsWidth = 8;\n\
    optional float scale9Width = 9;\n\
    optional float scale9Height = 10;\n\
    optional bool scale9Enable = 11;\n\
	optional bool flippedX = 12;\n\
	optional bool flippedY = 13;\n\
}\n\
\n\
// TextAtlasOptions\n\
message TextAtlasOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string stringValue = 3;\n\
    optional string charMapFile = 4;\n\
    optional ResourceData charMapFileData = 5;\n\
    optional string startCharMap = 6;\n\
    optional int32 itemWidth = 7;\n\
    optional int32 itemHeight = 8;\n\
}\n\
\n\
// TextBMFontOptions\n\
message TextBMFontOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string text = 3;\n\
    optional ResourceData fileNameData = 4;\n\
}\n\
\n\
// TextOptions\n\
message TextOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string fontName = 3;\n\
    optional ResourceData fontFile = 4;\n\
    optional int32 fontSize = 5;\n\
    optional string text = 6;\n\
    optional float areaWidth = 7;\n\
    optional float areaHeight = 8;\n\
    optional int32 hAlignment = 9;\n\
    optional int32 vAlignment = 10;\n\
    optional bool touchScaleEnable = 11;\n\
	optional ResourceData fontResource = 12;\n\
	optional bool IsCustomSize = 13;\n\
}\n\
\n\
// LoadingBarOptions\n\
message LoadingBarOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string texture = 3;\n\
    optional ResourceData textureData = 4;\n\
    optional int32 percent = 5;\n\
    optional int32 direction = 6;\n\
    optional float capInsetsX = 7;\n\
    optional float capInsetsY = 8;\n\
    optional float capInsetsWidth = 9;\n\
    optional float capInsetsHeight = 10;\n\
    optional bool scale9Enable = 11;\n\
	optional float scale9Width = 12;\n\
    optional float scale9Height = 13;\n\
}\n\
\n\
// ListViewOptions\n\
message ListViewOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string backGroundImage = 3;\n\
    optional ResourceData backGroundImageData = 4;\n\
    optional int32 bgColorR = 5;\n\
    optional int32 bgColorG = 6;\n\
    optional int32 bgColorB = 7;\n\
    optional int32 bgStartColorR = 8;\n\
    optional int32 bgStartColorG = 9;\n\
    optional int32 bgStartColorB = 10;\n\
    optional int32 bgEndColorR = 11;\n\
    optional int32 bgEndColorG = 12;\n\
    optional int32 bgEndColorB = 13;\n\
    optional int32 colorType = 14;\n\
    optional int32 bgColorOpacity = 15;\n\
    optional float vectorX = 16;\n\
    optional float vectorY = 17;\n\
    optional float capInsetsX = 18;\n\
    optional float capInsetsY = 19;\n\
    optional float capInsetsWidth = 20;\n\
    optional float capInsetsHeight = 21;\n\
    optional bool backGroundScale9Enable = 22;\n\
    optional float innerWidth = 23;\n\
    optional float innerHeight = 24;\n\
    optional bool clipAble = 25;\n\
    optional bool bounceEnable = 26;\n\
    optional int32 direction = 27;\n\
    optional int32 gravity = 28;\n\
    optional int32 itemMargin = 29;\n\
	optional float scale9Width = 30;\n\
    optional float scale9Height = 31;\n\
}\n\
\n\
// PageViewOptions\n\
message PageViewOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string backGroundImage = 3;\n\
    optional ResourceData backGroundImageData = 4;\n\
    optional bool clipAble = 5;\n\
    optional int32 bgColorR = 6;\n\
    optional int32 bgColorG = 7;\n\
    optional int32 bgColorB = 8;\n\
    optional int32 bgStartColorR = 9;\n\
    optional int32 bgStartColorG = 10;\n\
    optional int32 bgStartColorB = 11;\n\
    optional int32 bgEndColorR = 12;\n\
    optional int32 bgEndColorG = 13;\n\
    optional int32 bgEndColorB = 14;\n\
    optional int32 colorType = 15;\n\
    optional int32 bgColorOpacity = 16;\n\
    optional float vectorX = 17;\n\
    optional float vectorY = 18;\n\
    optional float capInsetsX = 19;\n\
    optional float capInsetsY = 20;\n\
    optional float capInsetsWidth = 21;\n\
    optional float capInsetsHeight = 22;\n\
    optional bool backGroundScale9Enable = 23;\n\
	optional float scale9Width = 24;\n\
    optional float scale9Height = 25;\n\
}\n\
\n\
// PanelOptions\n\
message PanelOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string backGroundImage = 3;\n\
    optional ResourceData backGroundImageData = 4;\n\
    optional bool clipAble = 5;\n\
    optional int32 bgColorR = 6;\n\
    optional int32 bgColorG = 7;\n\
    optional int32 bgColorB = 8;\n\
    optional int32 bgStartColorR = 9;\n\
    optional int32 bgStartColorG = 10;\n\
    optional int32 bgStartColorB = 11;\n\
    optional int32 bgEndColorR = 12;\n\
    optional int32 bgEndColorG = 13;\n\
    optional int32 bgEndColorB = 14;\n\
    optional int32 colorType = 15;\n\
    optional int32 bgColorOpacity = 16;\n\
    optional float vectorX = 17;\n\
    optional float vectorY = 18;\n\
    optional float capInsetsX = 19;\n\
    optional float capInsetsY = 20;\n\
    optional float capInsetsWidth = 21;\n\
    optional float capInsetsHeight = 22;\n\
    optional bool backGroundScale9Enable = 23;\n\
    optional int32 layoutType = 24;\n\
    optional bool adaptScreen = 25;\n\
	optional float scale9Width = 26;\n\
    optional float scale9Height = 27;\n\
}\n\
\n\
// ScrollViewOptions\n\
message ScrollViewOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string backGroundImage = 3;\n\
    optional ResourceData backGroundImageData = 4;\n\
    optional int32 bgColorR = 5;\n\
    optional int32 bgColorG = 6;\n\
    optional int32 bgColorB = 7;\n\
    optional int32 bgStartColorR = 8;\n\
    optional int32 bgStartColorG = 9;\n\
    optional int32 bgStartColorB = 10;\n\
    optional int32 bgEndColorR = 11;\n\
    optional int32 bgEndColorG = 12;\n\
    optional int32 bgEndColorB = 13;\n\
    optional int32 colorType = 14;\n\
    optional int32 bgColorOpacity = 15;\n\
    optional float vectorX = 16;\n\
    optional float vectorY = 17;\n\
    optional float capInsetsX = 18;\n\
    optional float capInsetsY = 19;\n\
    optional float capInsetsWidth = 20;\n\
    optional float capInsetsHeight = 21;\n\
    optional bool backGroundScale9Enable = 22;\n\
    optional float innerWidth = 23;\n\
    optional float innerHeight = 24;\n\
    optional int32 direction = 25;\n\
    optional bool clipAble = 26;\n\
    optional bool bounceEnable = 27;\n\
    optional int32 layoutType = 28;\n\
	optional float scale9Width = 29;\n\
    optional float scale9Height = 30;\n\
}\n\
\n\
// SliderOptions\n\
message SliderOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string barFileName = 3;\n\
    optional string ballNormal = 4;\n\
    optional string ballPressed = 5;\n\
    optional string ballDisabled = 6;\n\
    optional ResourceData barFileNameData = 7;\n\
    optional ResourceData ballNormalData = 8;\n\
    optional ResourceData ballPressedData = 9;\n\
    optional ResourceData ballDisabledData = 10;\n\
    optional ResourceData progressBarData = 11;\n\
    optional int32 percent = 12;\n\
    optional float capInsetsX = 13;\n\
    optional float capInsetsY = 14;\n\
    optional float capInsetsWidth = 15;\n\
    optional float capInsetsHeight = 16;\n\
    optional float barCapInsetsX = 17;\n\
    optional float barCapInsetsY = 18;\n\
    optional float barCapInsetsWidth = 19;\n\
    optional float barCapInsetsHeight = 20;\n\
    optional float progressBarCapInsetsX = 21;\n\
    optional float progressBarCapInsetsY = 22;\n\
    optional float progressBarCapInsetsWidth = 23;\n\
    optional float progressBarCapInsetsHeight = 24;\n\
    optional float scale9Width = 25;\n\
    optional float scale9Height = 26;\n\
    optional bool scale9Enable = 27;\n\
    optional float slidBallAnchorPointX = 28;\n\
    optional float slidBallAnchorPointY = 29;\n\
    optional float length = 30;\n\
	optional bool  displaystate = 31;\n\
}\n\
\n\
// SpriteOptions\n\
message SpriteOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional bool touchAble = 3;\n\
    optional int32 positionType = 4;\n\
    optional float positionPercentX = 5;\n\
    optional float positionPercentY = 6;\n\
    optional int32 sizeType = 7;\n\
    optional float sizePercentX = 8;\n\
    optional float sizePercentY = 9;\n\
    optional bool useMergedTexture = 10;\n\
    optional bool ignoreSize = 11;\n\
    optional LayoutParameter layoutParameter = 12;\n\
    optional string customProperty = 13;\n\
    optional string fileName = 14;\n\
	optional bool flippedX = 15;\n\
	optional bool flippedY = 16;\n\
	\n\
    optional ResourceData fileNameData = 17;\n\
}\n\
\n\
// TextFieldOptions\n\
message TextFieldOptions\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string fontName = 3;\n\
    optional ResourceData fontFile = 4;\n\
    optional int32 fontSize = 5;\n\
    optional string text = 6;\n\
    optional string placeHolder = 7;\n\
    optional bool passwordEnable = 8;\n\
    optional string passwordStyleText = 9;\n\
    optional bool maxLengthEnable = 10;\n\
    optional int32 maxLength = 11;\n\
    optional float areaWidth = 12;\n\
    optional float areaHeight = 13;\n\
	optional float anchorPointX = 15;\n\
    optional float anchorPointY = 16;\n\
	optional ResourceData fontResource = 14;\n\
	optional bool IsCustomSize = 17;\n\
}\n\
\n\
// TMXTiledMapOptions\n\
message TMXTiledMapOptions\n\
{\n\
    optional string tmxFile = 1;\n\
    optional string tmxString = 2;\n\
    optional string resourcePath = 3;\n\
\n\
    optional ResourceData fileNameData = 4;\n\
}\n\
\n\
// ParticleSystemOptions\n\
message ParticleSystemOptions\n\
{\n\
    optional string plistFile = 1;\n\
    optional int32 totalParticles = 2;  \n\
\n\
    optional ResourceData fileNameData = 3;\n\
}\n\
\n\
// ProjectNodeOptions\n\
message ProjectNodeOptions\n\
{\n\
    optional string fileName = 1;\n\
}\n\
\n\
// ComponentOptions\n\
message ComponentOptions\n\
{\n\
    optional string type = 1;\n\
\n\
    optional ComAudioOptions comAudioOptions = 2;\n\
}\n\
\n\
// ComAudioOptions\n\
message ComAudioOptions\n\
{\n\
    optional string name = 1;\n\
    optional bool enabled = 2;\n\
    optional bool loop = 3;\n\
    optional int32 volume = 4;\n\
    optional ResourceData fileNameData = 5;\n\
}\n\
\n\
\n\
// action\n\
message NodeAction\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 duration = 3;\n\
    optional float speed = 4;\n\
\n\
    repeated TimeLine timelines = 5;\n\
}\n\
\n\
// Timeline\n\
message TimeLine\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional string frameType = 3;\n\
    optional int32 actionTag = 4;\n\
    repeated Frame frames = 5;\n\
}\n\
\n\
//Frames\n\
message Frame\n\
{\n\
    optional TimeLineBoolFrame visibleFrame = 5;\n\
    optional TimeLineIntFrame zOrderFrame = 6;\n\
    optional TimeLinePointFrame rotationSkewFrame = 7;\n\
    optional TimeLineStringFrame eventFrame = 8;\n\
    optional TimeLinePointFrame anchorPointFrame = 9;\n\
    optional TimeLinePointFrame positionFrame = 10;\n\
    optional TimeLinePointFrame scaleFrame = 11;\n\
    optional TimeLineColorFrame colorFrame = 12;\n\
    optional TimeLineTextureFrame textureFrame = 13;\n\
}\n\
\n\
//VisibleFrame\n\
message TimeLineBoolFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional bool value = 5;\n\
}\n\
\n\
//ZOrderFrame RotationFrame\n\
message TimeLineIntFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional int32 value = 5;\n\
}\n\
\n\
//EventFrame\n\
message TimeLineStringFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional string value = 5;\n\
}\n\
\n\
//AnchorPointFrame PositionFrame ScaleFrame\n\
message TimeLinePointFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional float x = 5;\n\
	optional float y = 6;\n\
}\n\
\n\
//ColorFrame\n\
message TimeLineColorFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional int32 alpha = 5;\n\
    optional int32 red = 6;\n\
    optional int32 green = 7;\n\
    optional int32 blue = 8;\n\
}\n\
\n\
//TextureFrame\n\
message TimeLineTextureFrame\n\
{\n\
    optional string name = 1;\n\
    optional string classname = 2;\n\
    optional int32 frameIndex = 3;\n\
    optional bool tween = 4;\n\
    optional string filePath = 5;\n\
	optional string plistFile = 6;\n\
}";