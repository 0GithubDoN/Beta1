document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelector("#menuToggleBtn").addEventListener("click", toggleMenu);
    document.querySelector("#printBtn").addEventListener("click", printPage);
    document.querySelector("#exportImageBtn").addEventListener("click", exportAsImage);
    document.querySelector("#exportPdfBtn").addEventListener("click", correctedExportAsPDF);
    document.querySelector("#convertPdfBtn").addEventListener("click", triggerPdfInput);
    document.querySelector("#pdfInput").addEventListener("change", processPDFtoXLSX);
    document.querySelector("#importXlsxBtn").addEventListener("click", triggerXlsxInput);
    document.querySelector("#xlsxInput").addEventListener("change", importXLSX);
    document.querySelector("#addEmployeeBtn").addEventListener("click", addEmployee);
    document.querySelector("#saveChangesBtn").addEventListener("click", saveChanges);
    document.querySelector("#searchInput").addEventListener("keyup", searchTable);
    document.getElementById("darkModeSwitch").addEventListener("change", toggleDarkModeSwitch);
}

function toggleMenu() {
    var menuContent = document.querySelector('.menu-content');
    menuContent.classList.toggle('show');
}

function printPage() {
    document.querySelector('.search-container').style.display = 'none';
    document.querySelector('.logo-container').style.display = 'none';
    document.querySelectorAll('.no-print').forEach(element => element.style.display = 'none');
    window.print();
    document.querySelector('.search-container').style.display = 'block';
    document.querySelector('.logo-container').style.display = 'block';
    document.querySelectorAll('.no-print').forEach(element => element.style.display = 'table-cell');
}

function exportAsImage() {
    document.querySelectorAll('.no-print').forEach(element => element.style.display = 'none');
    html2canvas(document.querySelector("#scheduleTable")).then(canvas => {
        let link = document.createElement('a');
        link.download = 'schedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.querySelectorAll('.no-print').forEach(element => element.style.display = 'table-cell');
    }).catch(error => console.error('Error exporting image:', error));
}

function correctedExportAsPDF() {
    document.querySelectorAll('.no-print').forEach(element => element.style.display = 'none');
    html2canvas(document.querySelector("#scheduleTable"), { scale: 3, useCORS: true }).then(canvas => {
        const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('schedule.pdf');
        document.querySelectorAll('.no-print').forEach(element => element.style.display = 'table-cell');
    }).catch(error => console.error('Error exporting PDF:', error));
}

function triggerPdfInput() {
    document.querySelector("#pdfInput").click();
}

async function processPDFtoXLSX(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(e.target.result);
                console.log(`PDF loaded with ${pdfDoc.getPageCount()} page(s).`);
            } catch (error) {
                console.error('Error processing PDF:', error);
                alert('Failed to process PDF. Please check the file format.');
            }
        };
        reader.onerror = e => console.error('Error reading file:', e);
        reader.readAsArrayBuffer(file);
    }
}

function triggerXlsxInput() {
    document.querySelector("#xlsxInput").click();
}

function importXLSX(event) {
    showLoadingAnimation();
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        hideLoadingAnimation();
        showColumnMappingPopup(json);
    };
    reader.readAsArrayBuffer(file);
}

function showColumnMappingPopup(data) {
    let popup = document.getElementById('columnMappingPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'columnMappingPopup';
        document.body.appendChild(popup);
    }
    popup.style.display = 'block';
    let popupContent = popup.querySelector('.popup-content');
    if (!popupContent) {
        popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popup.appendChild(popupContent);
    }
    popupContent.innerHTML = '';

    let table = document.createElement('table');
    let headerRow = document.createElement('tr');
    data[0].forEach((header, index) => {
        let th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
        let select = document.createElement('select');
        select.id = 'header-map-' + index;
        select.innerHTML = '<option value="">Select column...</option>';
        ['Column1', 'Column2', 'Column3'].forEach(col => { // Replace these with your actual column names
            select.innerHTML += `<option value="${col}">${col}</option>`;
        });
        th.appendChild(select);
    });
    table.appendChild(headerRow);
    popupContent.appendChild(table);

    let applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Mapping';
    applyButton.onclick = applyColumnMappings;
    popupContent.appendChild(applyButton);
}

function applyColumnMappings() {
    // Logic to apply the selected mappings to process and display data accordingly
    console.log('Mappings applied.');
    // Additional implementation needed based on how data should be processed and displayed
}

function addEmployee() {
    var table = document.querySelector("#scheduleTable");
    var row = table.insertRow(-1);
    var cellCount = table.rows[0].cells.length - 1;

    for (let i = 0; i < cellCount; i++) {
        let cell = row.insertCell(i);
        cell.contentEditable = "true";
        if (i === 0) {
            cell.innerHTML = "New Employee";
        } else {
            cell.innerHTML = "";
        }
    }
    let deleteCell = row.insertCell(cellCount);
    deleteCell.innerHTML = '<button onclick="deleteRow(this)">Delete</button>';
    deleteCell.className = 'no-print';
    let colorPickerIcon = row.insertCell();
    colorPickerIcon.innerHTML = `<div class="color-picker-icon" onclick="showColorPicker(this)">&#x1F58C;</div><input type="color" class="color-picker" onchange="setColorForRow(this);" style="visibility:hidden; position:absolute;">`;
    colorPickerIcon.className = 'no-print';
}

function deleteRow(btn) {
    var row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveChanges() {
    var data = { employees: [] };
    var rows = document.querySelectorAll("#scheduleTable tr:not(:first-child)");
    rows.forEach(function(row) {
        var employee = {
            name: row.cells[0].textContent.trim(),
            days: []
        };
        for (var i = 1; i < row.cells.length - 2; i++) {
            employee.days.push(row.cells[i].textContent.trim());
        }
        employee.color = row.cells[row.cells.length - 1].querySelector('.color-picker').value;
        data.employees.push(employee);
    });

    fetch('save_schedule.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Data saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving data!');
    });
}

function searchTable() {
    let input = document.querySelector("#searchInput");
    let filter = input.value.toUpperCase();
    let table = document.querySelector("#scheduleTable");
    let tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

function showColorPicker(icon) {
    icon.nextElementSibling.style.visibility = 'visible';
}

function setColorForRow(picker) {
    let row = picker.closest('tr');
    row.style.backgroundColor = picker.value;
    picker.style.visibility = 'hidden';
}

function showLoadingAnimation() {
    console.log('Loading animation displayed.');
}

function hideLoadingAnimation() {
    console.log('Loading animation hidden.');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function toggleDarkModeSwitch() {
    // Toggle the dark mode
    toggleDarkMode();

    // Update the switcher button state based on dark mode status
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    darkModeSwitch.checked = document.body.classList.contains('dark-mode');
}
