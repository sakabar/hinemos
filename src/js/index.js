import Handsontable from 'handsontable';
import 'handsontable.css';

const init = () => {
    // location.href = URL_ROOT + "/signin.html";

    const data = [
        ["", "あ", "い", "う", "え"],
        ["あ", "","愛","会う","和え"],
        ["い","嫌","","言う","家"],
    ];
    const container = document.querySelector('.handsonTable');
    const hot = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: true,
    });

    const btn = document.querySelector('.btn');
    btn.addEventListener('click', () => {
        const row = document.querySelector('.row').value;
        const col = document.querySelector('.col').value;
        alert(hot.getDataAtCell(row, col));
    });
};



init();
