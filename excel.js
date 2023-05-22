let sheetNames = [];
let sheetState = [];
let sheetNamesOrigin = [];
let workBook;

document.addEventListener('DOMContentLoaded', function () {
    const excelFileInput = document.getElementById('file');

    excelFileInput.addEventListener('change', function (e) {
        const file = e.target;
        const reader = new FileReader(); //파일 리더

        reader.onload = function (e) {
            const data = reader.result;
            workBook = XLSX.read(data, { type: 'binary' });
            sheetNamesOrigin = [...workBook.SheetNames];
            sheetNameHandler(workBook.SheetNames);

            workBook.SheetNames.forEach(function (sheetName) {
                // console.log('SheetName: ' + sheetName);
                let jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
                // console.log(JSON.stringify(jsonData));
            })
        };
        reader.readAsBinaryString(file.files[0]);
    });
});

function drawTable(sheetName) {
    let jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
    console.log(jsonData);
    const excelTable = document.getElementById('excelTable');
    excelTable.innerHTML = '';

    const keys = Object.keys(jsonData[0]);
    const hrow = document.createElement('tr');
    keys.forEach((key) => {
        const th = document.createElement('th');
        th.textContent = key;
        hrow.appendChild(th);
    })
    excelTable.appendChild(hrow);
    console.log(excelTable);

    for (let i = 0; i < jsonData.length; i++) {//그리기
        const row = document.createElement('tr');
        keys.forEach((key) => {
            const cellData = jsonData[i][key];
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        })
        excelTable.appendChild(row);
    }
}

function drawAttributeList() {

}

// function readExcel() {
//     let input = event.target;
//     let reader = new FileReader(); //파일 리더

//     reader.onload = function () {
//         let data = reader.result;
//         let workBook = XLSX.read(data, { type: 'binary' });
//         sheetNameHandler(workBook.SheetNames);

//         workBook.SheetNames.forEach(function (sheetName) {
//             console.log('SheetName: ' + sheetName);
//             let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
//             console.log(JSON.stringify(rows));
//         })
//     };
//     reader.readAsBinaryString(input.files[0]);
// }

function sheetNameHandler(sheetname) {
    sheetNames = sheetname;
    const excelSheetList = document.getElementById('excelSheetList');
    const excelSheetContainer = document.getElementById('sheetsContainer');
    excelSheetList.innerHTML = "";
    excelSheetContainer.innerHTML = "";

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
    sheetElement.addEventListener('click', function () {
        console.log(sheetNamesOrigin[sheetNames.indexOf(sheetName)]);
        drawTable(sheetNamesOrigin[sheetNames.indexOf(sheetName)]);
    })
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
    span.id = sheetName;
    span.contentEditable = true;
    span.addEventListener("keypress", editName);
    sheetButton.appendChild(i);
    sheetButton.appendChild(span);

    return sheetButton;
}

function editName(e) {
    if (window.event.keyCode == 13) {
        e.preventDefault();
        document.activeElement.blur();
        const editedName = e.target.innerText;
        editStateSheetNames(e.target.id, editedName);
        e.target.id = editName;
    }
}

function editStateSheetNames(id, newName) {
    const index = sheetNames.indexOf(id);
    sheetNames[index] = newName;
    sheetNameHandler(sheetNames);
}

function ToggleIcon(buttonElement) {
    const targetIcon = buttonElement.querySelector('i');
    const currentClass = targetIcon.className;
    const newClass = (currentClass === rightIconClass) ? downIconClass : rightIconClass;
    targetIcon.className = newClass;
}

function ToggleBlock(classtype) {
    const targetBlock = document.getElementById(`${classtype}Behind`);
    const currentDisplay = targetBlock.style.display;
    const newDisplay = (currentDisplay === 'none') ? 'block' : 'none';
    targetBlock.style.display = newDisplay;
}