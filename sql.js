function drawSQLScript() {
    const sqlContainer = document.getElementById("sqlContainer");
    sqlContainer.innerHTML = "";

    const div = document.createElement("div");
    div.id = "sqlTextContainer";

    for (const tableName of sheetNamesState) {
        //console.log(`===================${tableName}===================`)
        div.appendChild(createCreateStatementStart(tableName));
        const table = attributeState[tableName];
        const attributeList = Object.keys(table);
        let pkNameList = [];
        let fkObjList = [];
        for (const attribute of attributeList) {
            const attributeName = attribute;
            const attributeDataType = determineDataTypeView(table[attribute]);
            const isPK = table[attribute].pk;
            const isFK = table[attribute].fk;
            div.appendChild(createCreateStatementAttribute(attributeName, attributeDataType));
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
        div.appendChild(createCreateStatementEnd());

        const dataTable = excelState[tableName];
        for (const tuple of dataTable) {
            div.appendChild(createInsertStatement(tableName, tuple));
        }
    }
    sqlContainer.appendChild(div);
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

function createCreateStatementAttribute(attributename, datatype) {
    const p = generateStatementElement();
    p.innerText = `\t\t${attributename.toUpperCase()}\t${datatype},`;
    return p;
}

function createCreateStatementPrimaryKey(keyAttributeList) {
    const p = generateStatementElement();
    if (keyAttributeList.length == 1) {
        p.innerText = `\t\tPRIMARY KEY(${keyAttributeList[0].toUpperCase()}),`
    }
    else {
        let statement = `\t\tPRIMARY KEY(`
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
    p.innerText = `\t\tFOREIGN KEY(${fkobj.referencingAttribute.toUpperCase()}) REFERENCES ${fkobj.referencedRelation.toUpperCase()}(${fkobj.referencedAttribute.toUpperCase()}),`;
    return p;
}

function createInsertStatement(tableName, valueObj) {
    const p = generateStatementElement();
    const attrs = Object.keys(valueObj);
    let statement = `INSERT INTO ${tableName.toUpperCase()} VALUES(`;

    for (const attr of attrs) {
        const dataType = attributeState[tableName][attr].dataType;
        let data = valueObj[attr];
        if (dataType === "DATE") data = extractYYYYMMDD(data);
        if (dataType === "TIME") data = extractHHMM(data);
        if (dataType === "DATETIME") data = `${extractYYYYMMDD(Math.floor(data))} ${extractHHMM(data % 1)}`;
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