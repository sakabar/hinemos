const threeStyleNavigatorUtils = require('./threeStyleNavigatorUtils');

const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = input.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const seq = line.split(' ');
    const alg = threeStyleNavigatorUtils.factorize(seq);

    // 因数分解に失敗した場合はゼロが返る
    if (alg) {
        if (alg.interchange.length === 1) {
            const interchange = alg.interchange[0];

            if ([ 'U', 'U\'', 'U2', ].includes(interchange)) {
                console.log(line);
            }
        }
    }
}
