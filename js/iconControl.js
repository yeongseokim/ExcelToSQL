const downIconClass = "fi fi-rr-angle-small-down";
const rightIconClass = "fi fi-rr-angle-small-right"

document.addEventListener('DOMContentLoaded', function () {
    const excelButton = document.getElementById('excelButton');
    excelButton.addEventListener('click', function () {
        const CLASSTYPE = "excel";
        ToggleIcon(excelButton);
        ToggleBlock(CLASSTYPE);
    });
});

function ToggleBlock(sheetName) {
    const targetBlock = document.getElementById(`${sheetName}Behind`);
    const currentDisplay = targetBlock.style.display;
    const newDisplay = (currentDisplay === 'none') ? '' : 'none';
    targetBlock.style.display = newDisplay;
}

function ToggleIcon(buttonElement) {
    const targetIcon = buttonElement.querySelector('i');
    const currentClass = targetIcon.className;
    const newClass = (currentClass === rightIconClass) ? downIconClass : rightIconClass;
    targetIcon.className = newClass;
}