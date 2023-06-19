/* Global State */
let excelState = {};
let sheetNamesState = [];
let attributeState = {};
let tableDependencyState = {};
const DATATYPE_UNNEED_LENGTH = ['INT', 'DATE', 'BOOLEAN', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'];
const DATATYPE_CAN_HAVE_LENGTH = ['BIGINT', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'FLOAT', 'DOUBLE'];
const DATATYPE_NEED_LENGTH = ['CHAR', 'VARCHAR', 'BLOB', 'TEXT', 'TINYTEXT', 'LONGTEXT', 'MEDIUMTEXT', 'ENUM', 'DECIMAL'];
const DATATYPE_STRING_INPUT_TYPE = ['CHAR', 'VARCHAR', 'BLOB', 'TEXT', 'TINYTEXT', 'LONGTEXT', 'MEDIUMTEXT', 'ENUM', 'DATE', 'BOOLEAN', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'];
const DATATYPE_INT = ['INT', 'BIGINT', 'TINYINT', 'SMALLINT', 'MEDIUMINT'];
const DATATYPE_FLOAT = ['FLOAT', 'DOUBLE'];

const CORRECT_INPUT_FORMAT = /^([a-zA-Z]+)\((\d+)\)$/;
const ERROR_UNVALID_FORMAT_MESSAGE = `유효하지 않은 입력 형식입니다.\n데이터의 길이를 명시할 경우 Datatype(Length)의 형식으로\nDatatype은 string, Length는 숫자로 입력해주세요.\n데이터 길이를 명시하지 않을 경우 data table의 최대 길이로 설정됩니다.`;
const ERROR_UNVALID_DATATYPE_MESSAGE = `유효하지 않은 데이터타입입니다.\n입력할 수 있는 데이터는 다음과 같습니다.\n
1. 숫자 데이터 타입: TINYINT, SMALLINT, MEDIUMINT, INT, BIGINT, FLOAT, DOUBLE, DECIMAL
2. 문자열 데이터 타입: CHAR, VARCHAR, TINYTEXT, TEXT, MEDIUMTEXT, LONGTEXT, ENUM
3. 날짜 및 시간 데이터 타입: DATE, TIME, DATETIME, TIMESTAMP, YEAR
4. 기타 데이터 타입: BOOLEAN, BLOB`;
const ERROR_UNVALID_LENGTH_DATATYPE_MESSAGE = function (maxLength) {
    return `유효하지 않은 데이터 길이입니다.\n존재하는 데이터보다 작은 길이를 입력할 수 없습니다. ${maxLength}보다 큰 값을 입력하거나 데이터 테이블을 수정하세요.`;
}
const ERROR_PRIMARY_KEY_CONSTRAINT_NULL = `기본 키에는 NULL 값이 올 수 없습니다.\n데이터 테이블에서 NULL 값을 수정하고 다시 시도하세요.`;
const ERROR_PRIMARY_KEY_CONSTRAINT_NOT_UNIQUE = `기본 키 값은 중복될 수 없습니다.\n데이터 테이블에서 중복 값을 수정하고 다시 시도하세요.`;

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
            searchMaxLength();

            drawSheetNames();
            drawTable(sheetNamesState[0]); //Default로 첫 번째 시트를 열음
            determineSQLContainerHeight(100);
            drawSQLScript();

            console.log(excelState);
            console.log(sheetNamesState);
            console.log(attributeState);
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
        tableDependencyState[table] = [];
        const firstAttriObj = excelState[table][0];
        const attributes = Object.keys(firstAttriObj);
        for (const attribute of attributes) {
            attributeState[table][attribute] = {};
            const data = firstAttriObj[attribute];
            attributeState[table][attribute].dataType = identifyDataType(data);
            attributeState[table][attribute].pk = false;
            attributeState[table][attribute].fk = false;
            attributeState[table][attribute].selectLength = false;

            if (DATATYPE_UNNEED_LENGTH.includes(attributeState[table][attribute].dataType) || DATATYPE_CAN_HAVE_LENGTH.includes(attributeState[table][attribute].dataType)) attributeState[table][attribute].isDataTypeSpecified = false;
            else attributeState[table][attribute].isDataTypeSpecified = true;
        }
    }
}

function identifyDataType(data) {
    if (typeof data === 'number' && !isNaN(data)) return "INT";
    return "CHAR"
}

function searchMaxLength() {
    const tableNames = Object.keys(attributeState);
    for (const table of tableNames) {
        const targetTable = excelState[table];
        const attributes = Object.keys(attributeState[table]);
        for (const attribute of attributes) {
            let currentMaxLength = 0;
            for (let i = 0; i < targetTable.length; i++) {
                const targetData = targetTable[i][attribute].toString().length;
                currentMaxLength = Math.max(currentMaxLength, targetData);
            }
            if (currentMaxLength >= 10 && attributeState[table][attribute].dataType === "INT") attributeState[table][attribute].dataType = "BIGINT";
            attributeState[table][attribute].maxLength = currentMaxLength;
        }
    }
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
            cell.id = `${sheetName}-${i}-${key}-data`
            cell.contentEditable = true;
            cell.addEventListener("keypress", editTableData);
            cell.textContent = cellData;
            row.appendChild(cell);
        }
        excelTable.appendChild(row);
    }
}

function editTableData(e) {
    if (window.event.keyCode == 13) {
        e.preventDefault();
        document.activeElement.blur();

        const [tableName, arrayIndex, attributeName] = e.target.id.split('-');
        let editedData = e.target.innerText;
        const dataType = attributeState[tableName][attributeName].dataType;
        const isNull = (editedData.toUpperCase() === "NULL");

        if (!isNull && DATATYPE_INT.includes(dataType)) editedData = parseInt(editedData);
        if (!isNull && DATATYPE_FLOAT.includes(dataType)) editedData = parseFloat(editedData);

        excelState[tableName][arrayIndex][attributeName] = editedData;
        console.log(excelState[tableName][arrayIndex][attributeName]);
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
        const preName = e.target.id;
        const editedName = e.target.innerText;
        editExcelState(preName, editedName);
        editAttributeState(preName, editedName);
        editSheetNamesState(preName, editedName);
        editTableDependencyState(preName, editedName);
        e.target.id = editedName;

        drawSheetNames();
        drawSQLScript();
        drawReferecingSelect();
    }
}

function editSheetNamesState(preName, newName) {
    const index = sheetNamesState.indexOf(preName);
    sheetNamesState[index] = newName;
}

function editExcelState(preName, newName) {
    excelState[newName] = { ...excelState[preName] };
    delete excelState[preName];
}

function editAttributeState(preName, newName) {
    attributeState[newName] = { ...attributeState[preName] };
    delete attributeState[preName];
}

function editTableDependencyState(preName, newName) {
    const attrs = Object.keys(attributeState[newName]);
    for (const attr of attrs) {
        const fkValue = attributeState[newName][attr].fk;
        if (fkValue && fkValue !== true) {
            const [tableName, attributeName] = fkValue.split('.');
            const newArr = tableDependencyState[tableName].map(item => (item === preName ? newName : item));
            tableDependencyState[tableName] = [...newArr];
        }
    }
    for (const targetTable of tableDependencyState[preName]) {
        const attributes = Object.keys(attributeState[targetTable]);
        for (const attribute of attributes) {
            const fkValue = attributeState[targetTable][attribute].fk;
            if (fkValue && fkValue !== true) {
                const [tableName, attributeName] = fkValue.split('.');
                if (tableName === preName) {
                    attributeState[targetTable][attribute].fk = `${newName}.${attributeName}`;
                }
            }
        }
    }
    tableDependencyState[newName] = [...tableDependencyState[preName]];
    delete tableDependencyState[preName];

    console.log(attributeState);
    console.log(tableDependencyState);
}

function createSheetContainerAttributeList(sheetName) {
    const targetTable = attributeState[sheetName];
    const attributeBox = document.createElement("div");

    if (!targetTable) {
        console.error(`Sheet '${sheetName}' does not exist in excelState.`);
        return attributeBox;
    }

    attributeBox.classList.add("attributeBox");
    attributeBox.id = `${sheetName}Behind`;
    attributeBox.style.display = "none";

    const attributes = Object.keys(targetTable);
    for (const attribute of attributes) {
        const targetObject = targetTable[attribute];
        const attributeList = document.createElement("tr"); //행 생성
        attributeList.id = `${sheetName}-${attribute}`

        const tdName = document.createElement("td"); //이름 열에는 키
        tdName.innerText = attribute;
        attributeList.appendChild(tdName);

        const tdDataType = document.createElement("td"); //데이터타입
        tdDataType.id = `${sheetName}-${attribute}-dataType`;
        tdDataType.contentEditable = true;
        tdDataType.innerText = determineDataTypeView(targetObject);
        tdDataType.addEventListener("keypress", editDataType);

        const constraintsPrimaryKey = document.createElement("td");
        const isPrimaryKey = document.createElement("button");
        isPrimaryKey.id = `${sheetName}-${attribute}-pk`;
        isPrimaryKey.innerText = "PK";
        isPrimaryKey.classList.add("constraintsButton");
        if (targetObject.pk) isPrimaryKey.classList.add("selectedButton");
        isPrimaryKey.addEventListener("click", constraintsHandler);
        constraintsPrimaryKey.appendChild(isPrimaryKey);

        const constraintsForeignKey = document.createElement("td");
        const isForeignKey = document.createElement("button");
        isForeignKey.id = `${sheetName}-${attribute}-fk`;
        isForeignKey.innerText = "FK";
        isForeignKey.classList.add("constraintsButton")
        if (targetObject.fk) isForeignKey.classList.add("selectedButton");
        isForeignKey.addEventListener("click", constraintsHandler);
        isForeignKey.addEventListener("click", fkHandler);
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

function determineDataTypeView(targetObj) {
    const dataType = targetObj.dataType;

    if (DATATYPE_UNNEED_LENGTH.includes(dataType)) return `${dataType}`;
    if (DATATYPE_CAN_HAVE_LENGTH.includes(dataType) && !targetObj.isDataTypeSpecified) return `${dataType}`
    if (targetObj.selectLength) return `${dataType}(${targetObj.selectLength})`;
    return `${dataType}(${targetObj.maxLength})`;
}

function editDataType(e) {
    if (window.event.keyCode == 13) {
        e.preventDefault();
        document.activeElement.blur();
        const editedDataType = e.target.innerText.toUpperCase();
        const [tableName, attributeName,] = e.target.id.split("-");

        if (DATATYPE_UNNEED_LENGTH.includes(editedDataType) || DATATYPE_CAN_HAVE_LENGTH.includes(editedDataType)) {
            attributeState[tableName][attributeName].dataType = editedDataType;
            attributeState[tableName][attributeName].isDataTypeSpecified = false;

            e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
            drawSQLScript();
            return;
        }

        if (DATATYPE_NEED_LENGTH.includes(editedDataType)) {
            attributeState[tableName][attributeName].dataType = editedDataType;
            attributeState[tableName][attributeName].isDataTypeSpecified = true;

            e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
            drawSQLScript();
            return;
        }

        if (!CORRECT_INPUT_FORMAT.test(editedDataType)) {
            alert(ERROR_UNVALID_FORMAT_MESSAGE);
            e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
            return;
        }

        const [, datatype, length] = editedDataType.match(CORRECT_INPUT_FORMAT);
        if (!DATATYPE_UNNEED_LENGTH.includes(datatype) && !DATATYPE_NEED_LENGTH.includes(datatype) && !DATATYPE_CAN_HAVE_LENGTH.includes(datatype)) {
            alert(ERROR_UNVALID_DATATYPE_MESSAGE);
            e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
            return;
        }

        if (attributeState[tableName][attributeName].maxLength > length) {
            alert(ERROR_UNVALID_LENGTH_DATATYPE_MESSAGE(attributeState[tableName][attributeName].maxLength));
            e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
            return;
        }

        if (DATATYPE_CAN_HAVE_LENGTH.includes(datatype)) {
            attributeState[tableName][attributeName].isDataTypeSpecified = true;
        }

        attributeState[tableName][attributeName].dataType = datatype;
        attributeState[tableName][attributeName].selectLength = length;

        e.target.innerText = determineDataTypeView(attributeState[tableName][attributeName]);
        drawSQLScript();
    }
}

function constraintsHandler(e) {
    const COLOR_CLASS_NAME = "selectedButton";
    const targetClassList = e.target.classList;
    const [tableName, attributeName, targetKey] = e.target.id.split("-");
    if (targetClassList.contains(COLOR_CLASS_NAME)) {
        targetClassList.remove(COLOR_CLASS_NAME);
        deleteDependency(tableName, attributeName, targetKey);
        attributeState[tableName][attributeName][targetKey] = false;
    }
    else {
        if (!checkEntityIntegrityConstraint(tableName, attributeName, targetKey)) return;
        targetClassList.add(COLOR_CLASS_NAME);
        attributeState[tableName][attributeName][targetKey] = true;
    }
    drawSQLScript();
}

function checkEntityIntegrityConstraint(tableName, attributeName, targetKey) {
    if (targetKey === 'fk') return true;
    const targetTableDataArray = excelState[tableName];
    let duplicateCheckArray = [];
    for (const dataObj of targetTableDataArray) {
        const targetData = dataObj[attributeName];
        if (targetData.toString().toUpperCase() === "NULL") {
            alert(ERROR_PRIMARY_KEY_CONSTRAINT_NULL);
            return false;
        };
        if (duplicateCheckArray.includes(targetData)) {
            alert(ERROR_PRIMARY_KEY_CONSTRAINT_NOT_UNIQUE);
            return false;
        }
        duplicateCheckArray.push(targetData);
        console.log(duplicateCheckArray);
    }
    return true;
}

function deleteDependency(tableName, attributeName, targetKey) {
    if (targetKey === 'pk') return;
    if (attributeState[tableName][attributeName][targetKey] === true) return;

    const [refTable,] = attributeState[tableName][attributeName][targetKey].split('.');
    const index = tableDependencyState[refTable].indexOf(tableName);
    if (index > -1) {
        tableDependencyState[refTable].splice(index, 1);
    }
}

function fkHandler(e) {
    const [tableName, attributeName, attributeKey] = e.target.id.split("-");
    const tr = document.getElementById(`${tableName}-${attributeName}`);

    if (attributeState[tableName][attributeName].fk) {
        const td = createDropdownTd(`${tableName}-${attributeName}-ref`);
        tr.appendChild(td);
        return;
    } else {
        const td = document.getElementById(`${tableName}-${attributeName}-ref`);
        tr.removeChild(td);
    }
}

function drawReferecingSelect() {
    for (const tableName of sheetNamesState) {
        const table = attributeState[tableName]
        const attributeList = Object.keys(table);
        for (const attribute of attributeList) {
            const fkState = table[attribute].fk;
            const tdId = `${tableName}-${attribute}-ref`;
            if (!fkState) continue;
            if (document.getElementById(tdId)) continue;

            const tr = document.getElementById(`${tableName}-${attribute}`)
            const td = createDropdownTd(tdId);
            tr.appendChild(td);

            if (fkState !== true) {
                const option = tr.querySelector(`option[value="${fkState}"]`);
                option.selected = true;
            }
        }
    }

}

function createDropdownTd(idName) {
    const td = document.createElement("td");
    td.id = idName;
    const select = createDropdown();
    td.appendChild(select);
    return td;
}

function createDropdown() {
    const select = document.createElement("select");
    select.classList.add("dropdown");
    const optionDefault = document.createElement("option");
    optionDefault.innerText = "table.attribute";
    select.appendChild(optionDefault);

    for (const table of sheetNamesState) {
        const attributeList = Object.keys(attributeState[table])
        for (const attribute of attributeList) {
            const option = document.createElement("option");
            const text = `${table}.${attribute}`;
            option.value = text;
            option.innerText = text;
            select.appendChild(option);
        }
    }

    select.addEventListener('change', setFK);

    return select;
}

function setFK(e) {
    const selectedOption = e.target.value;
    const [referencedTable,] = selectedOption.split('.');
    const [table, attribute,] = e.target.parentElement.id.split("-");
    attributeState[table][attribute].fk = selectedOption;
    tableDependencyState[referencedTable].push(table);
    drawSQLScript();
}
