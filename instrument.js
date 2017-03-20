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
        _this.gainNode = null;
        _this.compressor = ctx.createDynamicsCompressor();
        _this.compressor.connect(ctx.destination);

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
            isFadeIn: option.isFadeIn ? 1 : 0,
            fadeOutPlayMode: ['play', 'stop'].indexOf(option.fadeOutPlayMode) > -1 ? option.fadeOutPlayMode : 'default'
        };

        /**
         * 针对某个方法调用更改全局参数
         * @param resetOpt
         */
        _this.resetFuncInstrumentOption = function (resetOpt) {
            var funcInstrumentOption = _this.deepCopy(_this.instrumentOption);
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
        _this.setVolume = function (opt) {
            _this.gainNode.gain.value = opt.volume;
            if (opt.isFadeOut && opt.fadeOutPlayMode === 'play') {
                _this.linearRampToValueAtTime(1);
            } else if (opt.isFadeOut && opt.fadeOutPlayMode === 'stop') {
                _this.linearRampToValueAtTime(1);
            }
        };

        /**
         *  连接 oscillator + gainNode
         */
        _this.getNodesMix = function () {
            _this.gainNode.connect(_this.compressor);
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
            var playOptions = opt ? _this.resetFuncInstrumentOption(opt) : _this.deepCopy(_this.instrumentOption);
            if (!_this.oscillator) {
                _this.oscillator = ctx.createOscillator();   // 振荡器
                _this.oscillator.type = playOptions.oscillatorType;
                _this.oscillator.frequency.value = _this.getRealFrequencyByPitch(playOptions);
                _this.oscillator.start();

                // 控制声音的变化方式
                if (!(playOptions.isFadeOut && playOptions.fadeOutPlayMode === 'play')) {
                    playOptions.isFadeOut = 0;
                    playOptions.fadeOutPlayMode = 'default';
                }
                _this.gainNode = ctx.createGain();
                _this.setVolume(playOptions);
                _this.oscillator.connect(_this.gainNode);
                _this.gainNode.connect(_this.compressor);
            }

        };

        /**
         * stop 停止
         * @param opt
         */
        _this.stop = function (opt) {
            if (_this.oscillator) {
                var playOptions = opt ? _this.resetFuncInstrumentOption(opt) : _this.deepCopy(_this.instrumentOption);
                if (playOptions.isFadeOut && playOptions.fadeOutPlayMode === 'stop') {
                    _this.setVolume(playOptions);
                } else {
                    _this.gainNode.gain.value = 0;
                    _this.oscillator.stop(ctx.currentTime);
                }
                _this.oscillator = null;
            }

        };

        /**
         * 线性变化时间
         * @param duringTime
         */
        _this.linearRampToValueAtTime = function (duringTime) {
            _this.gainNode.gain.setValueAtTime(_this.gainNode.gain.value, ctx.currentTime);
            _this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duringTime);
        };



        /**
         * 对象深拷贝
         * @param source
         * @returns {{}}
         */
        _this.deepCopy = function (source) {
            var result = {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
                }
            }
            return result;
        };


        return _this;
    };


    /**
     *  摘录https://github.com/BenzLeung
     */
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Instrument;
    } else if (typeof define === 'function' && define.amd) {
        define(function() {
            return Instrument;
        });
    } else {
        window.Instrument = Instrument;
    }

})();