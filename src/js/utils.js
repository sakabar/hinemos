const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return `[${move1}, ${move2}]`;
    } else {
        return `[${setup}, [${move1}, ${move2}]]`;
    }
};

exports.showMove = showMove;
