/**
 * @file 超级马里奥
 * @author BenzLeung(https://github.com/BenzLeung)
 * @date 2017/3/20
 * Created by JetBrains PhpStorm.
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

var playMario = function () {
    var music = [
        'E5',
        'E5',
        '0',
        'E5',
        '0',
        'C5',
        'E5',
        '0',
        'G5',
        '0',
        '0',
        '0',
        'G4',
        '0',
        '0',
        '0'
    ];
    var ins = new Instrument({
        pitch: 'E5',
        frequency: 650,
        volume: 0.6,
        oscillatorType: 'square',
        isFadeOut : 1,
        fadeOutPlayMode : 'stop'
    });
    for (var i = 0, len = music.length; i < len; i ++) {
        setTimeout((function (x) {
            return function () {
                ins.stop();
                if (music[x] !== '0') {
                    ins.play({pitch: music[x]});
                }
            };
        })(i), 200 * i);
    }
};

playMario();
