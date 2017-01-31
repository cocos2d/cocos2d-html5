cc.profiler = (function () {
    var _showFPS = false;
    var _inited = false;
    var _frames = 0, _frameRate = 0, _lastSPF = 0, _accumDt = 0;
    var _afterVisitListener = null,
        _FPSLabel = document.createElement('div'),
        _SPFLabel = document.createElement('div'),
        _drawsLabel = document.createElement('div'),
        _fps = document.createElement('div');

    var LEVEL_DET_FACTOR = 0.6, _levelDetCycle = 10;
    var LEVELS = [0, 10, 20, 30];
    var _fpsCount = [0, 0, 0, 0];
    var _currLevel = 3, _analyseCount = 0, _totalFPS = 0;

    _fps.id = 'fps';
    _fps.style.position = 'absolute';
    _fps.style.padding = '3px';
    _fps.style.textAlign = 'left';
    _fps.style.backgroundColor = 'rgb(0, 0, 34)';
    _fps.style.bottom = cc.DIRECTOR_STATS_POSITION.y + '0px';
    _fps.style.left = cc.DIRECTOR_STATS_POSITION.x + 'px';
    _fps.style.width = '45px';
    _fps.style.height = '80px';

    var labels = [_drawsLabel, _SPFLabel, _FPSLabel];
    for (var i = 0; i < 3; ++i) {
        var style = labels[i].style;
        style.color = 'rgb(0, 255, 255)';
        style.font = 'bold 12px Helvetica, Arial';
        style.lineHeight = '20px';
        style.width = '100%';
        _fps.appendChild(labels[i]);
    }

    var analyseFPS = function (fps) {
        var lastId = LEVELS.length - 1, i = lastId, ratio, average = 0;
        _analyseCount++;
        _totalFPS += fps;

        for (; i >= 0; i--) {
            if (fps >= LEVELS[i]) {
                _fpsCount[i]++;
                break;
            }
        }

        if (_analyseCount >= _levelDetCycle) {
            average = _totalFPS / _levelDetCycle;
            for (i = lastId; i > 0; i--) {
                ratio = _fpsCount[i] / _levelDetCycle;
                // Determined level
                if (ratio >= LEVEL_DET_FACTOR && average >= LEVELS[i]) {
                    // Level changed
                    if (i != _currLevel) {
                        _currLevel = i;
                        profiler.onFrameRateChange && profiler.onFrameRateChange(average.toFixed(2));
                    }
                    break;
                }
                // If no level determined, that means the framerate is not stable
            }

            _changeCount = 0;
            _analyseCount = 0;
            _totalFPS = 0;
            for (i = lastId; i > 0; i--) {
                _fpsCount[i] = 0;
            }
        }
    };

    var afterVisit = function () {
        _lastSPF = cc.director.getSecondsPerFrame();
        _frames++;
        _accumDt += cc.director.getDeltaTime();
        
        if (_accumDt > cc.DIRECTOR_FPS_INTERVAL) {
            _frameRate = _frames / _accumDt;
            _frames = 0;
            _accumDt = 0;

            if (profiler.onFrameRateChange) {
                analyseFPS(_frameRate);
            }

            if (_showFPS) {
                var mode = cc._renderType === cc.game.RENDER_TYPE_CANVAS ? "\n canvas" : "\n webgl";
                _SPFLabel.innerHTML = _lastSPF.toFixed(3);
                _FPSLabel.innerHTML = _frameRate.toFixed(1).toString() + mode;
                _drawsLabel.innerHTML = (0 | cc.g_NumberOfDraws).toString();
            }
        }
    };

    var profiler = {
        onFrameRateChange: null,

        getSecondsPerFrame: function () {
            return _lastSPF;
        },
        getFrameRate: function () {
            return _frameRate;
        },

        setProfileDuration: function (duration) {
            if (!isNaN(duration) && duration > 0) {
                _levelDetCycle = duration / cc.DIRECTOR_FPS_INTERVAL;
            }
        },

        resumeProfiling: function () {
            cc.eventManager.addListener(_afterVisitListener, 1);
        },

        stopProfiling: function () {
            cc.eventManager.removeListener(_afterVisitListener);
        },

        isShowingStats: function () {
            return _showFPS;
        },

        showStats: function () {
            if (!_inited) {
                this.init();
            }

            if (_fps.parentElement === null) {
                cc.container.appendChild(_fps);
            }
            _showFPS = true;
        },

        hideStats: function () {
            _showFPS = false;
            if (_fps.parentElement === cc.container) {
                cc.container.removeChild(_fps);
            }
        },

        init: function () {
            if (!_inited) {
                _afterVisitListener = cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_VISIT, afterVisit);
                _inited = true;
            }
        }
    };

    return profiler;
})();
