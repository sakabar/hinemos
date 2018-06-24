const assert = require('assert');
const threeStyleScramblerJS = require('../src/js/threeStyleScrambler');

// 選択した3-styleに、(バッファを除き)同じパーツのステッカーが2回以上使われていないかどうかを判定
const isValid = (threeStyles) => {
    const partSet = new Set();

    for (let i = 0; i < threeStyles.length; i++) {
        const ts = threeStyles[i];
        const pair = threeStyleScramblerJS.getPartPair(ts.sticker1, ts.sticker2);
        partSet.add(pair[0]);
        partSet.add(pair[1]);
    }

    return partSet.size === 2 * threeStyles.length;
};

describe('threeStyleScrambler.js', () => {
    describe('getPartPair()', () => {
        it('正常系: 入力が空', () => {
            const actual = threeStyleScramblerJS.getPartPair('DFR', 'UFR');
            const expected = [ 'DFR', 'FRU', ];
            assert.deepEqual(actual, expected);
        });
    });

    describe('classifyWithPartPairs()', () => {
        it('正常系: 入力が空', () => {
            const arg = [];
            const actual = threeStyleScramblerJS.classifyWithPartPairs(arg);
            const expected = {};
            assert.deepEqual(actual, expected);
        });

        it('正常系: コーナー', () => {
            const arg = [
                {
                    buffer: 'UBL',
                    sticker1: 'UFR',
                    sticker2: 'RDF',
                    setup: '',
                    move1: 'U2',
                    move2: 'R\' D\' R',
                },
                {
                    buffer: 'UBL',
                    sticker1: 'DFR',
                    sticker2: 'UFR',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
            ];

            const actual = threeStyleScramblerJS.classifyWithPartPairs(arg);
            const expected = {
                // 2つのパーツはアルファベットの若い順に並べる
                // そして、キーに含まれる文字そのものも、アルファベットの若い順に並べる
                DFR: {
                    FRU: [
                        {
                            buffer: 'UBL',
                            sticker1: 'UFR',
                            sticker2: 'RDF',
                            setup: '',
                            move1: 'U2',
                            move2: 'R\' D\' R',
                        },
                        {
                            buffer: 'UBL',
                            sticker1: 'DFR',
                            sticker2: 'UFR',
                            setup: 'D U M M y',
                            move1: '',
                            move2: '',
                        },
                    ],
                },
            };
            assert.deepEqual(actual, expected);
        });

        it('正常系: コーナー: part2で枝分かれ', () => {
            const arg = [
                {
                    buffer: 'UBL',
                    sticker1: 'UFR',
                    sticker2: 'RDF',
                    setup: '',
                    move1: 'U2',
                    move2: 'R\' D\' R',
                },
                {
                    buffer: 'UBL',
                    sticker1: 'DFR',
                    sticker2: 'LFU',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
                {
                    buffer: 'UBL',
                    sticker1: 'DFR',
                    sticker2: 'UFR',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
            ];

            const actual = threeStyleScramblerJS.classifyWithPartPairs(arg);
            const expected = {
                DFR: {
                    FLU: [
                        {
                            buffer: 'UBL',
                            sticker1: 'DFR',
                            sticker2: 'LFU',
                            setup: 'D U M M y',
                            move1: '',
                            move2: '',
                        },
                    ],
                    FRU: [
                        {
                            buffer: 'UBL',
                            sticker1: 'UFR',
                            sticker2: 'RDF',
                            setup: '',
                            move1: 'U2',
                            move2: 'R\' D\' R',
                        },
                        {
                            buffer: 'UBL',
                            sticker1: 'DFR',
                            sticker2: 'UFR',
                            setup: 'D U M M y',
                            move1: '',
                            move2: '',
                        },
                    ],
                },
            };
            assert.deepEqual(actual, expected);
        });

        it('正常系: コーナー: part1で枝分かれ', () => {
            const arg = [
                {
                    buffer: 'UBL',
                    sticker1: 'UFR',
                    sticker2: 'RDF',
                    setup: '',
                    move1: 'U2',
                    move2: 'R\' D\' R',
                },
                {
                    buffer: 'UBL',
                    sticker1: 'DFL',
                    sticker2: 'FLU',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
                {
                    buffer: 'UBL',
                    sticker1: 'DFR',
                    sticker2: 'UFR',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
            ];

            const actual = threeStyleScramblerJS.classifyWithPartPairs(arg);
            const expected = {
                DFL: {
                    FLU: [
                        {
                            buffer: 'UBL',
                            sticker1: 'DFL',
                            sticker2: 'FLU',
                            setup: 'D U M M y',
                            move1: '',
                            move2: '',
                        },
                    ],
                },
                DFR: {
                    FRU: [
                        {
                            buffer: 'UBL',
                            sticker1: 'UFR',
                            sticker2: 'RDF',
                            setup: '',
                            move1: 'U2',
                            move2: 'R\' D\' R',
                        },
                        {
                            buffer: 'UBL',
                            sticker1: 'DFR',
                            sticker2: 'UFR',
                            setup: 'D U M M y',
                            move1: '',
                            move2: '',
                        },
                    ],
                },
            };
            assert.deepEqual(actual, expected);
        });
    });

    describe('pickThreeStyles()', () => {
        it('正常系: 入力が空', () => {
            const actual = threeStyleScramblerJS.pickThreeStyles([]);
            const expected = [];
            assert.deepEqual(actual, expected);
        });

        it('正常系: 入力された3-styleのリストの要素数が1の場合、必ずそれが選ばれる', () => {
            const ts = {
                buffer: 'UBL',
                sticker1: 'DFR',
                sticker2: 'LFU',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const threeStyleGroups = threeStyleScramblerJS.classifyWithPartPairs([ ts, ]);

            const actual = threeStyleScramblerJS.pickThreeStyles(threeStyleGroups);
            const expected = [
                {
                    buffer: 'UBL',
                    sticker1: 'DFR',
                    sticker2: 'LFU',
                    setup: 'D U M M y',
                    move1: '',
                    move2: '',
                },
            ];
            assert.deepEqual(actual, expected);
        });

        it('正常系: 入力された3-styleが3つで、それぞれパーツの重複が無い場合、3つ全てが選ばれる。順番は不定', () => {
            const ts1 = {
                buffer: 'UBL',
                sticker1: 'DFR',
                sticker2: 'LFU',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const ts2 = {
                buffer: 'UBL',
                sticker1: 'BDL',
                sticker2: 'BDR',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const ts3 = {
                buffer: 'UBL',
                sticker1: 'BRU',
                sticker2: 'DFL',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const arg = [ ts1, ts2, ts3, ];
            const threeStyleGroups = threeStyleScramblerJS.classifyWithPartPairs(arg);
            const actual = threeStyleScramblerJS.pickThreeStyles(threeStyleGroups);

            assert.deepEqual(actual.includes(ts1), true);
            assert.deepEqual(actual.includes(ts2), true);
            assert.deepEqual(actual.includes(ts3), true);
            assert.deepEqual(isValid(actual), true);
        });

        it('正常系: 入力された3-styleが2つで、複複がある場合、どちらかが選ばれる', () => {
            const ts1 = {
                buffer: 'DF',
                sticker1: 'FU',
                sticker2: 'UB',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const ts2 = {
                buffer: 'DF',
                sticker1: 'FU',
                sticker2: 'UR',
                setup: 'D U M M y',
                move1: '',
                move2: '',
            };

            const arg = [ ts1, ts2, ];
            const threeStyleGroups = threeStyleScramblerJS.classifyWithPartPairs(arg);

            const actual = threeStyleScramblerJS.pickThreeStyles(threeStyleGroups);

            assert.deepEqual(actual.length, 1);
            assert.deepEqual(actual.includes(ts1) || actual.includes(ts2), true);
        });
    });
});
