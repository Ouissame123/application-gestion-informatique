const printButton = document.getElementById('print-btn');

printButton.addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4');

    const tableHeaders = [
        'ID',
        'Sous Famille',
        'Marque',
        'Modèle',
        'Code ONEE',
        'N/S',
        'Matricule Affectataire',
        'Nom & Prénom',
        'Entité',
        'Remarque'
    ];

    const tableData = allData.map(item => [
        item.id,
        item.sub_family,
        item.brand,
        item.model,
        item.code_onee,
        item.serial_number,
        item.m_a,
        item.name_function,
        item.entity,
        item.remarks
    ]);

    doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 8,
            valign: 'middle',
            halign: 'center',
            overflow: 'linebreak',
            lineColor: [44, 62, 80],
            lineWidth: 0.75,
        },
        headStyles: {
            fillColor: [90, 90, 90],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            lineWidth: 1,
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 80 },
            2: { cellWidth: 80 },
        },
        margin: { top: 30, right: 20, bottom: 20, left: 20 },
        pageBreak: 'auto',
        showHead: 'firstPage',
        didDrawPage: function (data) {
            doc.setFontSize(16);
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(0, 51, 140);
            doc.text('Data List', data.settings.margin.left, 15);
        },
    });

    doc.save('data-list.pdf');
});