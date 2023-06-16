function drawSQLScript() {
    console.log("[실행]")
    const sqlContainer = document.getElementById("sqlContainer");
    sqlContainer.innerHTML = "";

    const div = document.createElement("div");
    div.id = "sqlTextContainer";

    const toggleButtonList = document.getElementsByClassName("toggleButton sheetButton");
    const attributeBox = document.getElementsByClassName("attributeBox");

    for (let i = 0; i < toggleButtonList.length; i++) {
        const buttonName = toggleButtonList[i].children[1].innerText;
        const attributeList = attributeBox[i].children;
        console.log(`=============Index: ${i} Name: ${buttonName}, =============`);
        div.appendChild(createCreateStatementStart(buttonName));

        for (const tr of attributeList) {
            const td = tr.children;
            const attributeName = td[0].innerText;
            const attributeDataType = td[1].innerText;
            const attributePK = td[2].children[0].classList.contains("selectedButton");
            const attributeFK = td[3].children[0].classList.contains("selectedButton");

            div.appendChild(createCreateStatementAttribute(attributeName, attributeDataType));

            console.log(`Value: ${attributeName}, ${attributeDataType}, ${attributePK}, ${attributeFK}`);
        }
        div.appendChild(createCreateStatementEnd());
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

function createCreateStatementForeignKey(referencingAttribute, referencedRelation, referencedAttribute) {
    const p = generateStatementElement();
    p.innerText = `\t\tFOREIGN KEY(${referencingAttribute.toUpperCase()}) REFERENCES ${referencedRelation.toUpperCase()}(${referencedAttribute.toUpperCase()}),`;
    return p;
}

function createInsertStatement(tableName, values) {
    const p = generateStatementElement();
    let statement = `INSERT INTO ${tableName.toUpperCase()} VALUES(`;
    for (let i = 0; i < values.length - 1; i++) {
        statement += values[i] + ", ";
    }
    statement += values[values.length - 1] + `);`;
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