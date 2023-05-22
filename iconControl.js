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

function ToggleBlock(classtype) {
    const targetBlock = document.getElementById(`${classtype}Behind`);
    const currentDisplay = targetBlock.style.display;
    const newDisplay = (currentDisplay === 'none') ? 'block' : 'none';
    targetBlock.style.display = newDisplay;
}

function ToggleIcon(buttonElement) {
    const targetIcon = buttonElement.querySelector('i');
    const currentClass = targetIcon.className;
    const newClass = (currentClass === rightIconClass) ? downIconClass : rightIconClass;
    targetIcon.className = newClass;
}

export function sheetNameToggle() {
    console.log("실행");
    const sheetNamesButton = document.getElementsByClassName("toggleButton");
    sheetNamesButton.array.forEach(element => {
        element.addEventListener('click', function () {
            const CLASSTYPE = "excel";
            ToggleIcon(element);
        })
    });
}