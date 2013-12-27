var preBtn = document.getElementById("preBtn");
var rePlayBtn = document.getElementById("rePlayBtn");
var nextBtn = document.getElementById("nextBtn");

var testCaseIndex = 0;

function playTestCase(flag){
    if(typeof cc == "undefined") return;
    if(typeof cc.resCfg == "undefined") return;
    if(typeof cc.resCfg.gameModules == "undefined") return;
}

preBtn.addEventListener("click", function(){
    playTestCase(-1);
});
rePlayBtn.addEventListener("click", function(){
    playTestCase(0);
});
nextBtn.addEventListener("click", function(){
    playTestCase(1);
});