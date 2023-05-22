import { sheetNameToggle } from "./iconControl.";

let sheetNames = [];

document.addEventListener('DOMContentLoaded', function () {
    const excelFileInput = document.getElementById('file');
    const excelTable = document.getElementById('excelTable');

    excelFileInput.addEventListener('change', function (e) {

        var file = e.target.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            excelTable.innerHTML = '';

            for (var i = 0; i < jsonData.length; i++) {//그리기
                var row = document.createElement('tr');

                for (var j = 0; j < jsonData[i].length; j++) {
                    var cellData = jsonData[i][j];
                    var cellType = (j === 0) ? 'th' : 'td';
                    var cell = document.createElement(cellType);
                    cell.textContent = cellData;
                    row.appendChild(cell);
                }

                excelTable.appendChild(row);
            }
        };

        reader.readAsArrayBuffer(file);
    });
});

function readExcel() {
    let input = event.target;
    let reader = new FileReader(); //파일 리더

    reader.onload = function () {
        let data = reader.result;
        let workBook = XLSX.read(data, { type: 'binary' });
        sheetNameHandler(workBook.SheetNames);
        workBook.SheetNames.forEach(function (sheetName) {
            console.log('SheetName: ' + sheetName);
            let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
            // console.log(JSON.stringify(rows));
        })
    };
    reader.readAsBinaryString(input.files[0]);
}

function sheetNameHandler(sheetname) {
    sheetNames = sheetname;
    console.log(sheetNames);
    const excelSheetList = document.getElementById('excelSheetList');
    const excelSheetContainer = document.getElementById('sheetsContainer');

    sheetNames.forEach(function (sheetName) {
        const sheetElement = createSheetElement(sheetName);
        const sheetButton = createSheetButton(sheetName);

        excelSheetList.appendChild(sheetElement);
        excelSheetContainer.appendChild(sheetButton);
    });
    sheetNameToggle();
}

function createSheetElement(sheetName) {
    const sheetElement = document.createElement('div');
    sheetElement.textContent = sheetName;
    return sheetElement;
}

function createSheetButton(sheetName) {
    const sheetButton = document.createElement('button');
    sheetButton.classList.add("toggleButton");

    const i = document.createElement("i");
    i.classList.add("fi", "fi-rr-angle-small-right");

    const span = document.createElement("span");
    span.innerHTML = sheetName;

    sheetButton.appendChild(i);
    sheetButton.appendChild(span);

    return sheetButton;
}