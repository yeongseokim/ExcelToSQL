/* Global State */
let excelState = {};
let sheetNamesState = [];
let attributeState = {};
const DATATYPE = ['INT', 'BIGINT', 'CHAR', 'VARCHAR', "DATE", "TIME", "DATETIME", "TIMESTAMP"];

/* File */
document.addEventListener('DOMContentLoaded', function () {
    const excelFileInput = document.getElementById('file');

    excelFileInput.addEventListener('change', function (e) {
        const file = e.target;
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = reader.result;
            const workBook = XLSX.read(data, { type: 'binary' });
            makeExcelObject(workBook, workBook.SheetNames);
            makeArray(workBook.SheetNames);
            makeAttributeObject();
            drawSheetNames();
            drawTable(sheetNamesState[0]); //Default로 첫 번째 시트를 열음
            determineSQLContainerHeight(100);
            drawSQLScript();
        };
        reader.readAsBinaryString(file.files[0]);
    });
});

function makeExcelObject(workBook, sheetNames) {
    sheetNames.forEach(function (sheetName) {
        excelState[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
    });
}

function makeArray(sheetNames) {
    sheetNamesState = [...sheetNames];
}

function makeAttributeObject() {
    const tableNames = Object.keys(excelState);
    for (const table of tableNames) {
        attributeState[table] = {};
        const firstAttriObj = excelState[table][0];
        const attributes = Object.keys(firstAttriObj);
        for (const attribute of attributes) {
            attributeState[table][attribute] = {};
            const data = firstAttriObj[attribute];
            attributeState[table][attribute].dataType = identifyDataType(data);
            attributeState[table][attribute].maxLength = data.toString().length;
            attributeState[table][attribute].pk = false;
            attributeState[table][attribute].fk = false;
        }
    }
    console.log(attributeState);
}

function identifyDataType(data) {
    if (typeof data === 'number' && !isNaN(data)) return "INT";
    if (data === "") return "NULL";
    return "CHAR"
}

function drawTable(sheetName) {
    const excelTable = document.getElementById('excelTable');
    excelTable.innerHTML = '';

    const targetTable = excelState[sheetName];
    const keys = Object.keys(targetTable[0]);

    const headerRow = document.createElement('tr'); //헤더 행 그리기
    for (const key of keys) {
        if (key.includes("EMPTY")) continue;
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }
    excelTable.appendChild(headerRow);

    for (let i = 0; i < targetTable.length; i++) {//나머지 행 그리기
        const row = document.createElement('tr');
        for (const key of keys) {
            if (key.includes("EMPTY")) continue;
            const cellData = targetTable[i][key];
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        }
        excelTable.appendChild(row);
    }
}

function drawSheetNames() {
    const excelContainerSheetList = document.getElementById('excelSheetList'); //excelContainer 하위
    const sheetContainerSheetList = document.getElementById('sheetsContainer'); //sheetContainer
    excelContainerSheetList.innerHTML = "";
    sheetContainerSheetList.innerHTML = "";

    sheetNamesState.forEach(function (sheetName) {
        const sheetElement = createExcelContainerSheetElement(sheetName);
        const sheetButton = createSheetContainerSheetButton(sheetName);
        const attributeBox = createSheetContainerAttributeList(sheetName);

        excelContainerSheetList.appendChild(sheetElement);

        sheetContainerSheetList.appendChild(sheetButton);
        sheetContainerSheetList.appendChild(attributeBox);
    });
    drawPKFKDescription();
}

function drawPKFKDescription() {
    const FirstToggleButton = document.getElementsByClassName("toggleButton sheetButton")[0];
    const div = document.createElement("div");
    div.id = "PKFKDesc";

    const pkspan = document.createElement("span");
    pkspan.innerText = "PK:PrimaryKey";
    pkspan.id = "PKDesc";
    const fkspan = document.createElement("span");
    fkspan.innerText = "FK:ForeignKey";
    fkspan.id = "FKDesc";

    div.appendChild(pkspan);
    div.appendChild(fkspan);
    FirstToggleButton.appendChild(div);
}

function createExcelContainerSheetElement(sheetName) {
    const sheetElement = document.createElement('div');
    sheetElement.classList.add("sheetListElement");
    sheetElement.addEventListener('click', function () {
        drawTable(sheetName);
    });

    const sheetSpan = document.createElement('span');
    sheetSpan.textContent = sheetName;
    sheetSpan.id = sheetName;
    sheetSpan.contentEditable = true;
    sheetSpan.addEventListener("keypress", editName);

    sheetElement.appendChild(sheetSpan);

    return sheetElement;
}

function createSheetContainerSheetButton(sheetName) {
    const sheetButton = document.createElement('button');
    sheetButton.classList.add("toggleButton", "sheetButton");
    sheetButton.addEventListener('click', function () {
        ToggleIcon(sheetButton);
        ToggleBlock(sheetName);
        determineSQLContainerHeight(0);
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
        editExcelState(e.target.id, editedName);
        editSheetNamesState(e.target.id, editedName);
        e.target.id = editedName;
    }
    drawSQLScript();
}

function editSheetNamesState(preName, newName) {
    const index = sheetNamesState.indexOf(preName);
    sheetNamesState[index] = newName;
    console.log(sheetNamesState);
    drawSheetNames();
}

function editExcelState(preName, newName) {
    console.log(preName, newName);
    excelState[newName] = { ...excelState[preName] };
    delete excelState[preName];
    console.log(excelState);
}

function createSheetContainerAttributeList(sheetName) {
    const targetTable = excelState[sheetName];
    const attributeBox = document.createElement("div");

    if (!targetTable) {
        console.error(`Sheet '${sheetName}' does not exist in excelState.`);
        return attributeBox;
    }


    attributeBox.classList.add("attributeBox");
    attributeBox.id = `${sheetName}Behind`;
    attributeBox.style.display = "none";

    const keys = Object.keys(targetTable[0]);
    for (const key of keys) {
        if (key.includes("EMPTY")) continue;
        const attributeList = document.createElement("tr"); //행 생성

        const tdName = document.createElement("td"); //이름 열에는 키
        tdName.innerText = key;
        attributeList.appendChild(tdName);

        const tdDataType = document.createElement("td"); //데이터타입
        tdDataType.contentEditable = true;
        //데이터 타입 갖고 오는 함수
        tdDataType.innerText = DATATYPE[0];
        tdDataType.addEventListener("keypress", editDataType);
        tdDataType.addEventListener("blur", editDataType);
        identifyDataType(sheetName, key);

        const constraintsPrimaryKey = document.createElement("td");
        const isPrimaryKey = document.createElement("button");
        isPrimaryKey.innerText = "PK";
        isPrimaryKey.classList.add("constraintsButton");
        isPrimaryKey.addEventListener("click", constraintsHandler);
        constraintsPrimaryKey.appendChild(isPrimaryKey);

        const constraintsForeignKey = document.createElement("td");
        const isForeignKey = document.createElement("button");
        isForeignKey.innerText = "FK";
        isForeignKey.classList.add("constraintsButton");
        isForeignKey.addEventListener("click", constraintsHandler)
        constraintsForeignKey.appendChild(isForeignKey);

        attributeList.classList.add("attributeList");
        attributeList.appendChild(tdName);
        attributeList.appendChild(tdDataType);
        attributeList.appendChild(constraintsPrimaryKey);
        attributeList.appendChild(constraintsForeignKey);

        attributeBox.appendChild(attributeList);
    }
    return attributeBox
}

function editDataType(e) {
    if (window.event.keyCode == 13 || e.type == "blur") {
        e.preventDefault();
        document.activeElement.blur();
        const editedDataType = e.target.innerText;
        // editSheetNamesState(e.target.id, editedName);
        // e.target.id = editName;
    }
}

function constraintsHandler(e) {
    const COLOR_CLASS_NAME = "selectedButton";
    console.dir(e.target.classList);
    if (e.target.classList.contains(COLOR_CLASS_NAME)) {
        e.target.classList.remove(COLOR_CLASS_NAME)
    }
    else {
        e.target.classList.add(COLOR_CLASS_NAME);
    }
}