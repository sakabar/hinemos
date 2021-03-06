// forループとかで効率的に書きたいけど、import()を動的に使うと
// Promiseが返ってきてうまくいかなかった
import c01 from '../../resource/cards/C-01.png';
import c02 from '../../resource/cards/C-02.png';
import c03 from '../../resource/cards/C-03.png';
import c04 from '../../resource/cards/C-04.png';
import c05 from '../../resource/cards/C-05.png';
import c06 from '../../resource/cards/C-06.png';
import c07 from '../../resource/cards/C-07.png';
import c08 from '../../resource/cards/C-08.png';
import c09 from '../../resource/cards/C-09.png';
import c10 from '../../resource/cards/C-10.png';
import c11 from '../../resource/cards/C-11.png';
import c12 from '../../resource/cards/C-12.png';
import c13 from '../../resource/cards/C-13.png';

import d01 from '../../resource/cards/D-01.png';
import d02 from '../../resource/cards/D-02.png';
import d03 from '../../resource/cards/D-03.png';
import d04 from '../../resource/cards/D-04.png';
import d05 from '../../resource/cards/D-05.png';
import d06 from '../../resource/cards/D-06.png';
import d07 from '../../resource/cards/D-07.png';
import d08 from '../../resource/cards/D-08.png';
import d09 from '../../resource/cards/D-09.png';
import d10 from '../../resource/cards/D-10.png';
import d11 from '../../resource/cards/D-11.png';
import d12 from '../../resource/cards/D-12.png';
import d13 from '../../resource/cards/D-13.png';

import h01 from '../../resource/cards/H-01.png';
import h02 from '../../resource/cards/H-02.png';
import h03 from '../../resource/cards/H-03.png';
import h04 from '../../resource/cards/H-04.png';
import h05 from '../../resource/cards/H-05.png';
import h06 from '../../resource/cards/H-06.png';
import h07 from '../../resource/cards/H-07.png';
import h08 from '../../resource/cards/H-08.png';
import h09 from '../../resource/cards/H-09.png';
import h10 from '../../resource/cards/H-10.png';
import h11 from '../../resource/cards/H-11.png';
import h12 from '../../resource/cards/H-12.png';
import h13 from '../../resource/cards/H-13.png';

import s01 from '../../resource/cards/S-01.png';
import s02 from '../../resource/cards/S-02.png';
import s03 from '../../resource/cards/S-03.png';
import s04 from '../../resource/cards/S-04.png';
import s05 from '../../resource/cards/S-05.png';
import s06 from '../../resource/cards/S-06.png';
import s07 from '../../resource/cards/S-07.png';
import s08 from '../../resource/cards/S-08.png';
import s09 from '../../resource/cards/S-09.png';
import s10 from '../../resource/cards/S-10.png';
import s11 from '../../resource/cards/S-11.png';
import s12 from '../../resource/cards/S-12.png';
import s13 from '../../resource/cards/S-13.png';

// 普通のカードじゃないもの
import gray from '../../resource/cards/gray.png';

const srcDict = {};
srcDict['C-01'] = c01;
srcDict['C-02'] = c02;
srcDict['C-03'] = c03;
srcDict['C-04'] = c04;
srcDict['C-05'] = c05;
srcDict['C-06'] = c06;
srcDict['C-07'] = c07;
srcDict['C-08'] = c08;
srcDict['C-09'] = c09;
srcDict['C-10'] = c10;
srcDict['C-11'] = c11;
srcDict['C-12'] = c12;
srcDict['C-13'] = c13;

srcDict['D-01'] = d01;
srcDict['D-02'] = d02;
srcDict['D-03'] = d03;
srcDict['D-04'] = d04;
srcDict['D-05'] = d05;
srcDict['D-06'] = d06;
srcDict['D-07'] = d07;
srcDict['D-08'] = d08;
srcDict['D-09'] = d09;
srcDict['D-10'] = d10;
srcDict['D-11'] = d11;
srcDict['D-12'] = d12;
srcDict['D-13'] = d13;

srcDict['H-01'] = h01;
srcDict['H-02'] = h02;
srcDict['H-03'] = h03;
srcDict['H-04'] = h04;
srcDict['H-05'] = h05;
srcDict['H-06'] = h06;
srcDict['H-07'] = h07;
srcDict['H-08'] = h08;
srcDict['H-09'] = h09;
srcDict['H-10'] = h10;
srcDict['H-11'] = h11;
srcDict['H-12'] = h12;
srcDict['H-13'] = h13;

srcDict['S-01'] = s01;
srcDict['S-02'] = s02;
srcDict['S-03'] = s03;
srcDict['S-04'] = s04;
srcDict['S-05'] = s05;
srcDict['S-06'] = s06;
srcDict['S-07'] = s07;
srcDict['S-08'] = s08;
srcDict['S-09'] = s09;
srcDict['S-10'] = s10;
srcDict['S-11'] = s11;
srcDict['S-12'] = s12;
srcDict['S-13'] = s13;
srcDict['gray'] = gray;

export default srcDict;
