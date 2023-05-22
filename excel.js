let sheetNames = [];
let sheetState = [];
let sheetNamesOrigin = [];
let workBook;

const DATATYPE = ['INT', 'CHAR(10)', 'CHAR(20)', 'VARCHAR(512)', "DATE"];

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
        };
        reader.readAsBinaryString(file.files[0]);
    });
});

function drawTable(sheetName) {
    let jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
    const excelTable = document.getElementById('excelTable');
    excelTable.innerHTML = '';

    const keys = Object.keys(jsonData[0]);
    const hrow = document.createElement('tr');
    for (const key of keys) {
        if (key.includes("EMPTY")) continue;
        const th = document.createElement('th');
        th.textContent = key;
        hrow.appendChild(th);
    }
    excelTable.appendChild(hrow);

    for (let i = 0; i < jsonData.length; i++) {//그리기
        const row = document.createElement('tr');
        for (const key of keys) {
            if (key.includes("EMPTY")) continue;
            const cellData = jsonData[i][key];
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        }
        excelTable.appendChild(row);
    }
}

function createAttributeList(sheetName) {
    const originalName = sheetNamesOrigin[sheetNames.indexOf(sheetName)]
    // const buttonElement = document.getElementById(sheetName).parentElement;

    let jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[originalName]);
    const keys = Object.keys(jsonData[0]);
    const attributeBox = document.createElement("div");
    attributeBox.classList.add("attributeBox");
    attributeBox.id = `${sheetName}Behind`;
    attributeBox.style.display = "none";


    for (const key of keys) {
        if (key.includes("EMPTY")) continue;
        const attributeList = document.createElement("tr");

        const name = document.createElement("td");
        name.innerText = key;
        attributeList.appendChild(name);

        const dropdowntd = document.createElement("td");
        const dropdownselect = createDropdown();
        dropdowntd.appendChild(dropdownselect);

        const constraints = document.createElement("td");
        const isPrimaryKey = document.createElement("input");
        isPrimaryKey.type = 'checkbox';
        const isForeignKey = document.createElement("input");
        isForeignKey.type = 'checkbox';
        attributeList.classList.add("attributeList");
        constraints.appendChild(isPrimaryKey);
        constraints.appendChild(isForeignKey);

        attributeList.appendChild(name);
        attributeList.appendChild(dropdowntd);
        attributeList.appendChild(constraints);

        attributeBox.appendChild(attributeList);
    }
    return attributeBox
    buttonElement.insertAdjacentElement('afterend', attributeBox);
}

function createDropdown() {
    const select = document.createElement("select");
    select.id = "dropdown";
    const optionDefault = document.createElement("option");
    optionDefault.innerText = "Datatype";
    select.appendChild(optionDefault);

    for (const type of DATATYPE) {
        const option = document.createElement("option");
        option.value = type;
        option.innerText = type;
        select.appendChild(option);
    }

    select.addEventListener('change', (event) => {
        const selectedOption = event.target.value;
        console.log('선택한 항목:', selectedOption);
        // 선택된 항목에 대한 추가 동작을 수행할 수 있습니다.
    });

    return select;
}

function dropdownHandler() {

}

function sheetNameHandler(sheetname) {
    sheetNames = sheetname;
    const excelSheetList = document.getElementById('excelSheetList');
    const excelSheetContainer = document.getElementById('sheetsContainer');
    excelSheetList.innerHTML = "";
    excelSheetContainer.innerHTML = "";

    sheetNames.forEach(function (sheetName) {
        const sheetElement = createSheetElement(sheetName);
        const sheetButton = createSheetButton(sheetName);
        const attributeBox = createAttributeList(sheetName);

        excelSheetList.appendChild(sheetElement);
        excelSheetContainer.appendChild(sheetButton);
        excelSheetContainer.appendChild(attributeBox);
    });
}

function createSheetElement(sheetName) {
    const sheetElement = document.createElement('div');
    sheetElement.classList.add("sheetListElement");
    sheetElement.textContent = sheetName;
    sheetElement.addEventListener('click', function () {
        drawTable(sheetNamesOrigin[sheetNames.indexOf(sheetName)]);
    })
    return sheetElement;
}

function createSheetButton(sheetName) {
    const sheetButton = document.createElement('button');
    sheetButton.classList.add("toggleButton", "sheetButton");
    sheetButton.addEventListener('click', function () {
        ToggleIcon(sheetButton);
        ToggleBlock(sheetName);
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
    const newDisplay = (currentDisplay === 'none') ? '' : 'none';
    targetBlock.style.display = newDisplay;
}