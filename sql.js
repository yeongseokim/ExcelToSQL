function drawSQLScript(isExport = false) {
    const sqlContainer = document.getElementById("sqlContainer");
    sqlContainer.innerHTML = "";

    const div = document.createElement("div");
    div.id = "sqlTextContainer";
    const tableOrder = isExport ? getTableOrder() : sheetNamesState;

    for (const tableName of tableOrder) {
        div.appendChild(createCreateStatementStart(tableName));
        const table = attributeState[tableName];
        const attributeList = Object.keys(table);
        let pkNameList = [];
        let fkObjList = [];
        for (const attribute of attributeList) {
            const targetAttribute = table[attribute];
            const attributeName = attribute;
            const attributeDataType = determineDataTypeView(targetAttribute);
            const isPK = targetAttribute.pk;
            const isFK = targetAttribute.fk;
            let otherConstaints = "";
            if (targetAttribute.default) otherConstaints += createDefaultString(targetAttribute.dataType, targetAttribute.default);
            if (targetAttribute.notnull) otherConstaints += otherConstaints.length > 0 ? " NOT NULL" : "NOT NULL";
            if (targetAttribute.unique) otherConstaints += otherConstaints.length > 0 ? " UNIQUE" : "UNIQUE";
            div.appendChild(createCreateStatementAttribute(attributeName, attributeDataType, otherConstaints));
            if (isPK) pkNameList.push(attribute);
            if (isFK && isFK !== true) {
                const fkobj = {};
                fkobj["referencingAttribute"] = attributeName;
                const [referencedRelation, referencedAttribute] = isFK.split('.');
                fkobj["referencedRelation"] = referencedRelation;
                fkobj["referencedAttribute"] = referencedAttribute;
                fkObjList.push(fkobj);
            }
        }
        if (pkNameList.length > 0) div.appendChild(createCreateStatementPrimaryKey(pkNameList));
        for (const fkObj of fkObjList) {
            div.appendChild(createCreateStatementForeignKey(fkObj))
        }
        div.lastChild.innerText = div.lastChild.innerText.slice(0, -1);
        div.appendChild(createCreateStatementEnd());
        div.insertAdjacentHTML('beforeend', `<br>`);

        const dataTable = excelState[tableName];
        for (const tuple of dataTable) {
            div.appendChild(createInsertStatement(tableName, tuple));
        }
        div.insertAdjacentHTML('beforeend', `<br>`);
    }
    sqlContainer.appendChild(div);
}

function getTableOrder() {
    const sortedArr = [];
    const visited = {};

    function topologicalSort(node) {
        visited[node] = true;

        if (tableDependencyState[node]) {
            for (let i = 0; i < tableDependencyState[node].length; i++) {
                const dependencyNode = tableDependencyState[node][i];

                if (!visited[dependencyNode]) {
                    topologicalSort(dependencyNode);
                }
            }
        }

        sortedArr.unshift(node);
    }

    for (let i = 0; i < sheetNamesState.length; i++) {
        const node = sheetNamesState[i];

        if (!visited[node]) {
            topologicalSort(node);
        }
    }
    return sortedArr;
}

function generateStatementElement() {
    return document.createElement('pre');
}

function createCreateStatementStart(tableName) {
    const p = generateStatementElement();
    p.innerText = `CREATE TABLE ${tableName.toUpperCase()} (`;
    return p;
}

function createCreateStatementEnd() {
    const p = generateStatementElement();
    p.innerText = `);`
    return p;
}

function createCreateStatementAttribute(attributename, datatype, otherConstaints) {
    const p = generateStatementElement();
    p.innerText = `\t${attributename.toUpperCase()}\t${datatype}${otherConstaints.length > 0 ? `\t` : ""}${otherConstaints},`;
    return p;
}

function createDefaultString(datatype, defaultValue) {
    if (defaultValue.toString().toUpperCase() === "NULL") return `DEFAULT NULL`;
    if (DATATYPE_INT.includes(datatype)) return `DEFAULT ${parseInt(defaultValue)}`;
    if (DATATYPE_FLOAT.includes(datatype)) return `DEFAULT ${parseFloat(defaultValue)}`;
    return `DEFAULT '${defaultValue}'`;
}

function createCreateStatementPrimaryKey(keyAttributeList) {
    const p = generateStatementElement();
    if (keyAttributeList.length == 1) {
        p.innerText = `\tPRIMARY KEY(${keyAttributeList[0].toUpperCase()}),`
    }
    else {
        let statement = `\tPRIMARY KEY(`
        for (let i = 0; i < keyAttributeList.length - 1; i++) {
            statement += keyAttributeList[i].toUpperCase() + ", ";
        }
        statement += keyAttributeList[keyAttributeList.length - 1].toUpperCase() + "),";
        p.innerText = statement;
    }
    return p;
}

function createCreateStatementForeignKey(fkobj) {
    const p = generateStatementElement();
    p.innerText = `\tFOREIGN KEY(${fkobj.referencingAttribute.toUpperCase()}) REFERENCES ${fkobj.referencedRelation.toUpperCase()}(${fkobj.referencedAttribute.toUpperCase()}),`;
    return p;
}

function createInsertStatement(tableName, valueObj) {
    const p = generateStatementElement();
    const attrs = Object.keys(valueObj);
    let statement = `INSERT INTO ${tableName.toUpperCase()} VALUES(`;

    for (const attr of attrs) {
        const dataType = attributeState[tableName][attr].dataType;
        let data = valueObj[attr];
        if (dataType === "DATE" && countDigits(data.toString()) !== 8) data = extractYYYYMMDD(data);
        if (dataType === "TIME") data = extractHHMM(data % 1);
        if (dataType === "DATETIME") data = `${extractYYYYMMDD(Math.floor(data))} ${extractHHMM(data % 1)}`;
        if (DATATYPE_STRING_INPUT_TYPE.includes(dataType)) data = `'${data}'`;
        statement += data + ", ";
    }
    statement = statement.slice(0, -2) + `);`;
    p.innerText = statement;
    return p;
}

function determineSQLContainerHeight(addition) {
    const sheetsContainer = document.getElementById('sheetsContainer');
    const sqlContainer = document.getElementById('sqlContainer');
    const sheetsContainerHeight = sheetsContainer.offsetHeight;
    sqlContainer.style.maxHeight = `${sheetsContainerHeight + addition}px`;
}

function extractYYYYMMDD(cellValue) {
    return XLSX.SSF.format('yyyy-mm-dd', cellValue);
}

function extractHHMM(cellValue) {
    const hours = Math.floor(cellValue * 24);
    const minutes = Math.floor(cellValue * 24 * 60) % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
}

function countDigits(dateData) {
    const digits = dateData.match(/\d/g);
    if (digits === null) return 0;
    return digits.length;
}