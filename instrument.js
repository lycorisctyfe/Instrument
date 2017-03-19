/**
 *  @file Instrument.js   发声必备姿势
 *
 *  我师傅说: 每位工程师都有保持代码优雅的义务
 *  each engineer has a duty to keep the code elegant
 */
(function () {
    var audioContext = AudioContext || webkitAudioContext;
    var ctx = new audioContext();

    var Instrument = function (option) {
        var _this = this;
        _this.oscillator = null;

        /**
         * 初始化参数 从Instrument(option)
         * @type {{frequency: *, pitch: *, oscillatorType: *, volume: *}}
         */
        _this.instrumentOption = {
            frequency: isNaN(option.frequency) ? 0 : option.frequency,
            pitch: option.pitch ? option.pitch : '',
            oscillatorType: ['sine', 'square', 'sawtooth', 'triangle'].indexOf(option.oscillatorType) > -1 ? option.oscillatorType : 'square',
            volume: option.volume > 0 && option.volume <= 1 ? option.volume : '0.5',
            isFadeOut: option.isFadeOut ? 1 : 0,
            isFadeIn : option.isFadeIn ? 1 : 0,
            fadeOutPlayMode : ['play', 'stop'].indexOf(option.fadeOutPlayMode) > -1 ? option.fadeOutPlayMode : 'default'
        };

        /**
         * 针对某个方法调用更改全局参数
         * @param resetOpt
         */
        _this.resetFuncInstrumentOption = function (resetOpt) {
            var funcInstrumentOption = _this.instrumentOption;
            for (var i in resetOpt) {
                if (resetOpt.hasOwnProperty(i)) {
                    funcInstrumentOption[i] = resetOpt[i];
                }
            }
            // 方法中直接传frequency 则不优先匹配pitch
            if (resetOpt.hasOwnProperty('frequency') && !resetOpt.hasOwnProperty('pitch')) {
                funcInstrumentOption['pitch'] = '';
            }

            return funcInstrumentOption;
        };

        /**
         * 支持使用Instrument
         * @returns {boolean}
         */
        _this.support = function () {
            return !!audioContext;
        };

        /**
         * 音量控制
         * @returns {*}
         */
        _this.setVolume = function () {
            var gainNode = ctx.createGain();
            gainNode.gain.value = _this.instrumentOption.volume;
            return gainNode;
        };

        /**
         *  连接audioNodes
         */
        _this.getNodesMix = function () {
            var audioNodes = arguments;
            var compressor = ctx.createDynamicsCompressor();
            var gainNode = _this.setVolume();
            for (var i in audioNodes) {
                audioNodes[i].connect(compressor);
            }
            gainNode = compressor.connect(gainNode);
            gainNode.connect(ctx.destination);
        };

        /**
         * 从pitch获取频率或直接使用频率  优先处理音高pitch
         * @returns {number}
         */
        _this.getRealFrequencyByPitch = function (opt) {
            var fz = 0;
            if (opt.pitch && frequencyParam[opt.pitch]) {
                fz = frequencyParam[opt.pitch];
            } else if (opt.frequency) {
                fz = opt.frequency;
            } else {
                console.log("no frequency!");
            }
            return fz;
        };

        /**
         * 使用oscillator发声
         */
        _this.play = function (opt) {
            if (!_this.support()) {
                console.log("您的浏览器不支持web audio api,请换个姿势试试~");
                return false;
            }

            var playOptions = opt ? _this.resetFuncInstrumentOption(opt) : _this.instrumentOption;
            if (!_this.oscillator) {
                console.log(playOptions);
                _this.oscillator = ctx.createOscillator();   // 振荡器
                _this.oscillator.type = playOptions.oscillatorType;
                _this.oscillator.frequency.value = _this.getRealFrequencyByPitch(playOptions);
                _this.oscillator.start();
                _this.getNodesMix(_this.oscillator);
                if (playOptions.isFadeOut && playOptions.fadeOutPlayMode === 'play') {
                    _this.changePitchMode(playOptions);
                }
            }

        };

        _this.stop = function (opt) {
            if (_this.oscillator) {
                opt = opt ? _this.resetFuncInstrumentOption(opt) : _this.instrumentOption;
                if (opt.isFadeOut && opt.fadeOutPlayMode === 'stop') {
                    _this.changePitchMode(opt);
                } else {
                    _this.oscillator.stop(ctx.currentTime);
                    _this.oscillator = null;
                }
            }

        };
        /**
         * 控制声音的播放 渐入、渐出
         */
        _this.changePitchMode = function (opt) {
            // fadeOut 声音渐出有两种方式:
            // play 播放的时候按照一定的时长淡出声音；
            // stop 停止声音播放的时候不立即停止 而在松手慢慢淡出声音
            if (opt.isFadeOut && opt.fadeOutPlayMode === 'play') {
                _this.changeFrequency(10, 100);
            } else if (opt.isFadeOut && opt.fadeOutPlayMode == 'stop') {
                _this.changeFrequency(10, 10);
            }
        };

        /**
         * 控制频率的变化
         */
        _this.changeFrequency = function (step, time) {
            var timer = null;
            timer = setInterval(function () {
                if (_this.oscillator && _this.oscillator.frequency.value > 0) {
                    _this.oscillator.frequency.value -= step;
                } else if (_this.oscillator && _this.oscillator.frequency.value <= 0) {
                    _this.oscillator.stop(ctx.currentTime);
                    //_this.oscillator.frequency.value = 0;
                    _this.oscillator = null;
                    clearInterval(timer);
                }
            }, time);
        };

        return _this;
    };


    // 测试数据

    // oscillator值  sine/square/锯齿波 sawtooth/三角波 triangle/custom(setPeriodicWave())
    var opt = {
        pitch: 'B5',
        frequency: 400,
        volume: 0.9,
        oscillatorType: 'square',
        isFadeOut : true,
        fadeOutPlayMode : 'play'
    };
    var ins = new Instrument(opt);


    document.onkeydown = function (e) {
        if (e && e.keyCode === 13) {
            //{pitch: 'Db5'}
            ins.play();
        }
    };
    document.onkeyup = function (e) {
        if (e && e.keyCode === 13) {
            ins.stop();
        }
    };

})();