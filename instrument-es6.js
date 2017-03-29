/**
 * @file 发声必备姿势之es6版
 * @author Lycoris_cty(https://github.com/lycorisctyfe)
 * @date 2017/3/29
 * Created by JetBrains PhpStorm.
 *
 * 我师父说：每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

import FREQ from './frequentParam/equal-temperament-es6';

const AudioContext = window['AudioContext'] || window['webkitAudioContext'];
const ctx = new AudioContext();

class Instrument {

    constructor(options) {

        this.oscillator = null;
        this.gainNode = null;
        this.compressor = ctx['createDynamicsCompressor']();
        this.compressor['connect'](ctx['destination']);

        this.instrumentOption = {
            frequency: 0,
            oscillatorType: 'square',
            volume: 0.5,
            isFadeOut: 0,
            isFadeIn: 0,
            fadeOutPlayMode: 'default'
        };
        Object.assign(this.instrumentOption, options);

        if (options.pitch && !options.frequency) {
            this.instrumentOption.frequency = FREQ[options.pitch] || 0;
        }
    }

    /**
     * 支持使用Instrument
     * @returns {boolean}
     */
    static support() {
        return !!AudioContext;
    }

    /**
     * 音量控制
     */
    setVolume(opt) {
        if (this.gainNode) {
            if (opt.volume) {
                this.gainNode['gain']['value'] = opt['volume'];
            }
            if (opt.isFadeOut && opt.fadeOutPlayMode === 'play') {
                this.linearRampToValueAtTime(1);
            } else if (opt.isFadeOut && opt.fadeOutPlayMode === 'stop') {
                this.linearRampToValueAtTime(1);
            }
        }
    }

    /**
     * 线性变化时间
     * @param duringTime
     */
    linearRampToValueAtTime(duringTime) {
        this.gainNode['gain']['setValueAtTime'](this.gainNode['gain']['value'], ctx.currentTime);
        this.gainNodethis.gainNode['gain']['linearRampToValueAtTime'](0, ctx.currentTime + duringTime);
    }

    /**
     * 使用oscillator发声
     * @param opt
     */
    play(opt) {
        if (!Instrument.support()) {
            window.console.log("您的浏览器不支持web audio api,请换个姿势试试~");
            return false;
        }
        let playOptions = Object.assign({}, this.instrumentOption, opt);

        if (playOptions.pitch && !playOptions.frequency) {
            playOptions.frequency = FREQ[playOptions.pitch] || 0;
        }

        if (this.oscillator) {
            this.stop();
        }

        if (playOptions.frequency) {
            this.oscillator = ctx['createOscillator']();   // 振荡器
            this.oscillator.type = playOptions.oscillatorType;
            this.oscillator.frequency.value = playOptions.frequency;

            // 控制声音的变化方式
            if (!(playOptions.isFadeOut && playOptions.fadeOutPlayMode === 'play')) {
                playOptions.isFadeOut = 0;
                playOptions.fadeOutPlayMode = 'default';
            }
            this.gainNode = ctx['createGain']();
            this.setVolume(playOptions);
            this.oscillator['connect'](this.gainNode);
            this.gainNode['connect'](this.compressor);

            this.oscillator.onended = function () {
                this.gainNode = null;
            }.bind(this);
            this.oscillator.start();
        }
    }

    /**
     * stop 停止
     * @param opt
     */
    stop(opt) {
        if (this.oscillator) {
            let playOptions = Object.assign({}, this.instrumentOption, opt);
            if (playOptions.isFadeOut && playOptions.fadeOutPlayMode === 'stop') {
                this.setVolume(playOptions);
            } else {
                this.oscillator.stop(ctx.currentTime);
            }
        }
    }
}

export default Instrument;