var res = {
    HelloWorld: "res/HelloWorld.jpg",
    CloseNormal: "res/CloseNormal.png",
    CloseSelected: "res/CloseSelected.png",
    //loading
    glow_png:'res_engine/progress_light.png',
    preload_logo_png:'res_engine/preload_logo.png',
    preload_title_png:'res_engine/preload_title.png',
    preload_bg_jpg:'res_engine/preload_bg.jpg',
    progress_bar_png:'res_engine/progress_bar.png',
    progress_bg_png:'res_engine/progress_bg.png',
    progress_shadow_png:'res_engine/progress_shadow.png',
    dialog_bg_png:"res_engine/dialog_bg.png",
    dialog_cancel_normal_png:"res_engine/dialog_cancel_normal.png",
    dialog_cancel_press_png:"res_engine/dialog_cancel_press.png",
    dialog_confirm_normal_png:"res_engine/dialog_confirm_normal.png",
    dialog_confirm_press_png:"res_engine/dialog_confirm_press.png"
}
window["boot"] = [
    res.glow_png,
    res.preload_logo_png,
    res.preload_bg_jpg,
    res.progress_bar_png,
    res.progress_bg_png,
    res.progress_shadow_png,
    res.dialog_bg_png,
    res.dialog_cancel_normal_png,
    res.dialog_cancel_press_png,
    res.dialog_confirm_normal_png,
    res.dialog_confirm_press_png
];
window["game"] = [
    res.HelloWorld,
    res.CloseNormal,
    res.CloseSelected
];