function downloadSQL() {
    const sqlText = document.getElementById('sqlTextContainer').innerText;
    const blob = new Blob([sqlText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    a.href = url;
    a.download = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}ExcellenToSQL.sql`;
    a.click();
    URL.revokeObjectURL(url);
}

function copySQL() {
    const sqlText = document.getElementById('sqlTextContainer').innerText;

    navigator.clipboard.writeText(sqlText)
        .then(() => {
            console.log('SQL text copied to clipboard');
            alert("SQL text copied to clipboard");
        })
        .catch((error) => {
            console.error('Failed to copy SQL text', error);
        });
}