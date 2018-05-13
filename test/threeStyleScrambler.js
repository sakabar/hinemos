const assert = require('assert');
const threeStyleScramberJS = require('../src/js/threeStyleScrambler');

describe('threeStyleScrambler.js', () => {
    describe('getPartPair()', () => {
        it('正常系: 入力が空', () => {
            const actual = threeStyleScramberJS.getPartPair('DFR', 'UFR');
            const expected = [ 'DFR', 'FRU', ];
            assert.deepEqual(actual, expected);
        });
    });

    describe('classifyWithPartPairs()', () => {
        it('正常系: 入力が空', () => {
            const arg = [];
            const actual = threeStyleScramberJS.classifyWithPartPairs(arg);
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

            const actual = threeStyleScramberJS.classifyWithPartPairs(arg);
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

            const actual = threeStyleScramberJS.classifyWithPartPairs(arg);
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

            const actual = threeStyleScramberJS.classifyWithPartPairs(arg);
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
});
