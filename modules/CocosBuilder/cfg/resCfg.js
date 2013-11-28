var cc = cc || {};
cc.resCfg = cc.resCfg || {};

/**
 * cc.resCfg[js_core.a_js] = {ref : [], res : []}
 */

var resCfg = cc.resCfg;

//base for core module
resCfg["cocosbuilder"] = {
    ref : [
        js.cocosbuilder.CCControl_js,
        js.cocosbuilder.CCControlButton_js,
        js.cocosbuilder.CCControlUtils_js,
        js.cocosbuilder.CCInvocation_js,
        js.cocosbuilder.CCScale9Sprite_js,
        js.cocosbuilder.CCMenuPassive_js,
        js.cocosbuilder.CCControlSaturationBrightnessPicker_js,
        js.cocosbuilder.CCControlHuePicker_js,
        js.cocosbuilder.CCControlColourPicker_js,
        js.cocosbuilder.CCControlSlider_js,
        js.cocosbuilder.CCControlSwitch_js,
        js.cocosbuilder.CCControlStepper_js,
        js.cocosbuilder.CCControlPotentiometer_js,

        js.cocosbuilder.CCNodeLoader_js,
        js.cocosbuilder.CCBReaderUtil_js,
        js.cocosbuilder.CCControlLoader_js,
        js.cocosbuilder.CCSpriteLoader_js,
        js.cocosbuilder.CCNodeLoaderLibrary_js,
        js.cocosbuilder.CCBReader_js,
        js.cocosbuilder.CCBValue_js,
        js.cocosbuilder.CCBKeyframe_js,
        js.cocosbuilder.CCBSequence_js,
        js.cocosbuilder.CCBRelativePositioning_js,
        js.cocosbuilder.CCBAnimationManager_js
    ]
};
