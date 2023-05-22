let sheetNames = [];

document.addEventListener('DOMContentLoaded', function () {
    const excelFileInput = document.getElementById('file');

    excelFileInput.addEventListener('change', function (e) {
        const file = e.target;
        const reader = new FileReader(); //파일 리더

        reader.onload = function (e) {
            const data = reader.result;
            const workBook = XLSX.read(data, { type: 'binary' });

            sheetNameHandler(workBook.SheetNames);

            workBook.SheetNames.forEach(function (sheetName) {
                console.log('SheetName: ' + sheetName);
                let jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
                drawTable(jsonData);
                console.log(JSON.stringify(rows));
            })
        };
        reader.readAsBinaryString(file.files[0]);
    });
});

function drawTable(jsonData) {
    const excelTable = document.getElementById('excelTable');
    excelTable.innerHTML = '';
    for (let i = 0; i < jsonData.length; i++) {//그리기
        var row = document.createElement('tr');

        for (let j = 0; j < jsonData[i].length; j++) {
            var cellData = jsonData[i][j];
            var cellType = (j === 0) ? 'th' : 'td';
            var cell = document.createElement(cellType);
            cell.textContent = cellData;
            row.appendChild(cell);
        }

        excelTable.appendChild(row);
    }
}

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
            console.log(JSON.stringify(rows));
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
}

function createSheetElement(sheetName) {
    const sheetElement = document.createElement('div');
    sheetElement.classList.add("sheetListElement");
    sheetElement.textContent = sheetName;
    return sheetElement;
}

function createSheetButton(sheetName) {
    const sheetButton = document.createElement('button');
    sheetButton.classList.add("toggleButton", "sheetButton");
    sheetButton.addEventListener('click', function () {
        ToggleIcon(sheetButton);
    });

    const i = document.createElement("i");
    i.classList.add("fi", "fi-rr-angle-small-right");

    const span = document.createElement("span");
    span.innerHTML = sheetName;

    sheetButton.appendChild(i);
    sheetButton.appendChild(span);

    return sheetButton;
}

function ToggleIcon(buttonElement) {
    const targetIcon = buttonElement.querySelector('i');
    const currentClass = targetIcon.className;
    const newClass = (currentClass === rightIconClass) ? downIconClass : rightIconClass;
    targetIcon.className = newClass;
}