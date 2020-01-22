const assert = require('assert');
const appPageUtils = require('../src/js/appPageUtils');

describe('appPageUtils.js', () => {
    describe('flattenRouteDict()', () => {
        it('正常系: 空', () => {
            const routeDict = {};
            const actual = appPageUtils.flattenRouteDict(routeDict);
            const expected = {};
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 一重', () => {
            const routeDict = {
                faq: () => 1,
            };

            const actual = appPageUtils.flattenRouteDict(routeDict);
            const expected = {
                'faq.html': routeDict['faq'],
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 二重', () => {
            const routeDict = {
                faq: () => 1,
                memoTraining: {
                    index: () => 2,
                    cards: () => 3,
                },
            };

            const actual = appPageUtils.flattenRouteDict(routeDict);
            const expected = {
                'faq.html': routeDict['faq'],
                'memoTraining/index.html': routeDict['memoTraining']['index'],
                'memoTraining/cards.html': routeDict['memoTraining']['cards'],
            };
            assert.deepStrictEqual(actual, expected);
        });
    });
});
